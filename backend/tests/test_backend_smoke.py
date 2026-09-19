"""
CareConnect Final Backend Verification Suite.
Covers all functional, security, ownership, role-authorization, and failure cases.
Can be executed directly via Python or with pytest.
"""

import sys
import uuid
from pathlib import Path
from decimal import Decimal

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal
from app.models.user import User

client = TestClient(app)


def test_careconnect_backend():
    print("\n" + "=" * 60)
    print("CARECONNECT FINAL BACKEND VERIFICATION SUITE")
    print("=" * 60)

    unique_run = uuid.uuid4().hex[:6]
    test_results = []

    def check(test_name: str, passed: bool, detail: str = ""):
        num = len(test_results) + 1
        status_str = "PASS" if passed else "FAIL"
        print(f"[{status_str}] #{num:02d} {test_name} {('- ' + detail) if detail else ''}")
        test_results.append((num, test_name, passed, detail))
        assert passed, f"FAILED #{num:02d} {test_name}: {detail}"

    # ----------------------------------------------------
    # 1. System Endpoints (Root & Health)
    # ----------------------------------------------------
    r_root = client.get("/")
    r_health = client.get("/health")
    check(
        "Root and Health Endpoints",
        r_root.status_code == 200 and r_health.status_code == 200 and r_health.json().get("status") == "healthy",
        f"Root: {r_root.status_code}, Health: {r_health.status_code}"
    )

    # ----------------------------------------------------
    # 2. Registration & Input Normalization & Role Validation
    # ----------------------------------------------------
    admin_email = f" Admin_{unique_run}@CareConnect.org "
    donor_a_email = f"donor_a_{unique_run}@careconnect.org"
    donor_b_email = f"donor_b_{unique_run}@careconnect.org"
    vol_a_email = f"vol_a_{unique_run}@careconnect.org"
    vol_b_email = f"vol_b_{unique_run}@careconnect.org"
    orph_a_email = f"orph_a_{unique_run}@careconnect.org"
    orph_b_email = f"orph_b_{unique_run}@careconnect.org"
    pwd = "password123"

    # Register admin with leading/trailing spaces and mixed case email
    r_reg_admin = client.post("/auth/register", json={
        "name": "Admin User",
        "email": admin_email,
        "password": pwd,
        "role": "admin"
    })
    check("Admin User Registration", r_reg_admin.status_code == 200, f"Status: {r_reg_admin.status_code}")

    # Register other roles
    r_reg_da = client.post("/auth/register", json={"name": "Donor A", "email": donor_a_email, "password": pwd, "role": "donor"})
    r_reg_db = client.post("/auth/register", json={"name": "Donor B", "email": donor_b_email, "password": pwd, "role": "donor"})
    r_reg_va = client.post("/auth/register", json={"name": "Volunteer A", "email": vol_a_email, "password": pwd, "role": "volunteer"})
    r_reg_vb = client.post("/auth/register", json={"name": "Volunteer B", "email": vol_b_email, "password": pwd, "role": "volunteer"})
    r_reg_oa = client.post("/auth/register", json={"name": "Orphanage Rep A", "email": orph_a_email, "password": pwd, "role": "both"})
    r_reg_ob = client.post("/auth/register", json={"name": "Orphanage Rep B", "email": orph_b_email, "password": pwd, "role": "both"})
    check(
        "Standard User Roles Registration",
        all(r.status_code == 200 for r in [r_reg_da, r_reg_db, r_reg_va, r_reg_vb, r_reg_oa, r_reg_ob]),
        "All donor, volunteer, and both role users registered"
    )

    # 3. Invalid Registration: Arbitrary Role (Must reject with 422)
    r_reg_inv_role = client.post("/auth/register", json={
        "name": "Hacker",
        "email": f"hacker_{unique_run}@careconnect.org",
        "password": pwd,
        "role": "superadmin"
    })
    check("Invalid Role Rejected (HTTP 422)", r_reg_inv_role.status_code == 422, f"Status: {r_reg_inv_role.status_code}")

    # 4. Invalid Registration: Invalid Data (short password, invalid email)
    r_reg_short_pwd = client.post("/auth/register", json={
        "name": "Short Pwd",
        "email": f"short_{unique_run}@careconnect.test",
        "password": "123",
        "role": "donor"
    })
    r_reg_bad_email = client.post("/auth/register", json={
        "name": "Bad Email",
        "email": "not-an-email",
        "password": pwd,
        "role": "donor"
    })
    check(
        "Invalid Registration Data Rejected (HTTP 422)",
        r_reg_short_pwd.status_code == 422 and r_reg_bad_email.status_code == 422,
        "Short password and invalid email rejected"
    )

    # 5. Duplicate Registration Rejected (HTTP 400)
    r_reg_dup = client.post("/auth/register", json={
        "name": "Donor A Duplicate",
        "email": donor_a_email,
        "password": pwd,
        "role": "donor"
    })
    check("Duplicate Email Registration Rejected (HTTP 400)", r_reg_dup.status_code == 400, f"Status: {r_reg_dup.status_code}")

    # ----------------------------------------------------
    # 6. Login & Authentication
    # ----------------------------------------------------
    tokens = {}
    headers = {}
    for role_name, em in [
        ("admin", admin_email.strip().lower()),
        ("donor_a", donor_a_email),
        ("donor_b", donor_b_email),
        ("vol_a", vol_a_email),
        ("vol_b", vol_b_email),
        ("orph_a", orph_a_email),
        ("orph_b", orph_b_email),
    ]:
        r_login = client.post("/auth/login", json={"email": em, "password": pwd})
        assert r_login.status_code == 200, f"Login failed for {em}: {r_login.text}"
        token = r_login.json()["access_token"]
        tokens[role_name] = token
        headers[role_name] = {"Authorization": f"Bearer {token}"}

    check("Login & Token Generation", len(tokens) == 7, "Tokens obtained for all 7 testing identities")

    # 7. Invalid Credentials Login (HTTP 401)
    r_bad_pwd = client.post("/auth/login", json={"email": donor_a_email, "password": "wrongpassword"})
    r_bad_user = client.post("/auth/login", json={"email": f"nonexistent_{unique_run}@test.com", "password": pwd})
    check(
        "Invalid Login Credentials (HTTP 401)",
        r_bad_pwd.status_code == 401 and r_bad_user.status_code == 401,
        f"Bad password: {r_bad_pwd.status_code}, Unknown user: {r_bad_user.status_code}"
    )

    # ----------------------------------------------------
    # 8. JWT Authentication & Validation
    # ----------------------------------------------------
    r_no_auth = client.get("/users/me")
    r_bad_token = client.get("/users/me", headers={"Authorization": "Bearer malformed.token.here"})
    check(
        "Missing & Invalid JWT Handling (HTTP 401)",
        r_no_auth.status_code == 401 and r_bad_token.status_code == 401,
        f"No token: {r_no_auth.status_code}, Bad token: {r_bad_token.status_code}"
    )

    # ----------------------------------------------------
    # 9. User Profile & Password Privacy
    # ----------------------------------------------------
    r_profile = client.get("/users/me", headers=headers["donor_a"])
    prof_data = r_profile.json()
    donor_a_id = prof_data.get("id")
    check(
        "User Profile Retrieval (/users/me)",
        r_profile.status_code == 200 and "password" not in prof_data and "password_hash" not in prof_data and prof_data.get("role") == "donor",
        "Valid profile returned; password_hash is strictly absent"
    )

    # ----------------------------------------------------
    # 10. Role Authorization: Donor vs Volunteer vs Admin
    # ----------------------------------------------------
    # Donor can access /donations/my, blocked from /volunteers/me (403)
    r_donor_don = client.get("/donations/my", headers=headers["donor_a"])
    r_donor_vol = client.get("/volunteers/me", headers=headers["donor_a"])
    # Volunteer can access /events/my/participations, blocked from /donations/my (403)
    r_vol_part = client.get("/events/my/participations", headers=headers["vol_a"])
    r_vol_don = client.get("/donations/my", headers=headers["vol_a"])
    # Normal user blocked from /admin/users (403)
    r_norm_admin = client.get("/admin/users", headers=headers["donor_a"])
    r_real_admin = client.get("/admin/users", headers=headers["admin"])

    check(
        "Role Boundaries Enforcement (HTTP 403 vs 200)",
        r_donor_don.status_code == 200 and r_donor_vol.status_code == 403 and
        r_vol_part.status_code == 200 and r_vol_don.status_code == 403 and
        r_norm_admin.status_code == 403 and r_real_admin.status_code == 200,
        "Donor, Volunteer, and Admin permissions strictly isolated"
    )

    # ----------------------------------------------------
    # 11. Orphanage Creation & Permissions
    # ----------------------------------------------------
    # Donor cannot create orphanage (403)
    r_don_create_orph = client.post("/orphanages", headers=headers["donor_a"], json={
        "name": "Donor Fake Orphanage",
        "address": "Nowhere"
    })
    # Orphanage Rep A creates orphanage profile
    r_create_orph_a = client.post("/orphanages", headers=headers["orph_a"], json={
        "name": f"Sunrise Orphanage {unique_run}",
        "address": "100 Sunshine Way"
    })
    orph_a_id = r_create_orph_a.json().get("id")
    # Orphanage Rep B creates orphanage profile
    r_create_orph_b = client.post("/orphanages", headers=headers["orph_b"], json={
        "name": f"Haven Orphanage {unique_run}",
        "address": "200 Harbor Road"
    })
    orph_b_id = r_create_orph_b.json().get("id")

    # Duplicate orphanage creation for Rep A (400)
    r_create_orph_dup = client.post("/orphanages", headers=headers["orph_a"], json={
        "name": "Duplicate Sunrise",
        "address": "100 Sunshine Way"
    })

    check(
        "Orphanage Creation & Role Protection",
        r_don_create_orph.status_code == 403 and
        r_create_orph_a.status_code == 201 and
        r_create_orph_b.status_code == 201 and
        r_create_orph_dup.status_code == 400,
        f"Donor blocked 403; Orphanages created (IDs: {orph_a_id}, {orph_b_id}); Duplicate blocked 400"
    )

    # ----------------------------------------------------
    # 12. Orphanage Profile Management (GET/PUT /orphanages/me)
    # ----------------------------------------------------
    # Donor blocked with 403 from /orphanages/me
    r_don_get_orph_me = client.get("/orphanages/me", headers=headers["donor_a"])
    r_don_put_orph_me = client.put("/orphanages/me", headers=headers["donor_a"], json={"name": "New Name"})
    # Rep A can get and update own orphanage
    r_get_orph_me = client.get("/orphanages/me", headers=headers["orph_a"])
    r_put_orph_me = client.put("/orphanages/me", headers=headers["orph_a"], json={"name": f"Sunrise Children Home {unique_run}"})

    check(
        "Orphanage Profile Management & Donor Isolation",
        r_don_get_orph_me.status_code == 403 and
        r_don_put_orph_me.status_code == 403 and
        r_get_orph_me.status_code == 200 and
        r_put_orph_me.status_code == 200 and
        r_put_orph_me.json()["name"] == f"Sunrise Children Home {unique_run}",
        "Donor blocked with 403; Orphanage owner successfully updated profile"
    )

    # ----------------------------------------------------
    # 13. Admin Orphanage Verification
    # ----------------------------------------------------
    r_admin_verify = client.put(f"/admin/orphanages/{orph_a_id}/verify", headers=headers["admin"])
    r_unauth_verify = client.put(f"/admin/orphanages/{orph_a_id}/verify", headers=headers["donor_a"])
    check(
        "Admin Orphanage Verification & Authorization",
        r_admin_verify.status_code == 200 and
        r_admin_verify.json()["verification_status"] == "verified" and
        r_unauth_verify.status_code == 403,
        "Orphanage status updated to verified; non-admin blocked 403"
    )

    # ----------------------------------------------------
    # 14. Item Requests CRUD & Ownership Protection
    # ----------------------------------------------------
    # Donor cannot create request (403)
    r_don_create_req = client.post("/requests", headers=headers["donor_a"], json={
        "title": "Unauthorized Request",
        "item_type": "food",
        "quantity_needed": 10
    })
    # Orphanage A creates request
    r_create_req = client.post("/requests", headers=headers["orph_a"], json={
        "title": "Winter Clothes",
        "description": "Warm jackets for winter season",
        "item_type": "clothing",
        "quantity_needed": 15,
        "urgency": "high"
    })
    item_req_id = r_create_req.json().get("id")

    # Public list & get request
    r_list_req = client.get("/requests")
    r_get_req = client.get(f"/requests/{item_req_id}")

    # Orphanage B cannot update Orphanage A's request (403)
    r_b_edit_req = client.put(f"/requests/{item_req_id}", headers=headers["orph_b"], json={"quantity_needed": 99})
    # Orphanage A updates own request (200)
    r_a_edit_req = client.put(f"/requests/{item_req_id}", headers=headers["orph_a"], json={"quantity_needed": 18})

    check(
        "Item Requests CRUD & Cross-Orphanage Isolation",
        r_don_create_req.status_code == 403 and
        r_create_req.status_code == 201 and
        r_list_req.status_code == 200 and
        r_get_req.status_code == 200 and
        r_b_edit_req.status_code == 403 and
        r_a_edit_req.status_code == 200 and
        r_a_edit_req.json()["quantity_needed"] == 18,
        "Donor blocked 403; CRUD verified; Orphanage B cannot edit Orphanage A request (403)"
    )

    # ----------------------------------------------------
    # 15. Donations: Money & Item Validation
    # ----------------------------------------------------
    # Money donation with positive amount
    r_don_money = client.post("/donations", headers=headers["donor_a"], json={
        "orphanage_id": orph_a_id,
        "donation_type": "money",
        "amount": 250.00
    })
    don_money_id = r_don_money.json().get("id")

    # Item donation with positive quantity and description
    r_don_item = client.post("/donations", headers=headers["donor_a"], json={
        "orphanage_id": orph_a_id,
        "request_id": item_req_id,
        "donation_type": "item",
        "item_description": "18 winter jackets",
        "quantity": 18
    })
    don_item_id = r_don_item.json().get("id")

    # Invalid: money donation without amount (422)
    r_inv_money = client.post("/donations", headers=headers["donor_a"], json={
        "orphanage_id": orph_a_id,
        "donation_type": "money"
    })
    # Invalid: item donation without quantity (422)
    r_inv_item = client.post("/donations", headers=headers["donor_a"], json={
        "orphanage_id": orph_a_id,
        "donation_type": "item",
        "item_description": "Some shoes"
    })

    check(
        "Donation Creation & Validation (Money & Item)",
        r_don_money.status_code == 201 and
        r_don_item.status_code == 201 and
        r_inv_money.status_code == 422 and
        r_inv_item.status_code == 422,
        f"Money & Item donations created (IDs: {don_money_id}, {don_item_id}); Missing required fields rejected with 422"
    )

    # ----------------------------------------------------
    # 16. Donation Receipts & Ownership Security
    # ----------------------------------------------------
    # Donor A accesses own receipt (200)
    r_receipt_da = client.get(f"/donations/{don_money_id}/receipt", headers=headers["donor_a"])
    # Donor B accesses Donor A's receipt (403)
    r_receipt_db = client.get(f"/donations/{don_money_id}/receipt", headers=headers["donor_b"])
    # Orphanage A owner accesses receipt (200)
    r_receipt_oa = client.get(f"/donations/{don_money_id}/receipt", headers=headers["orph_a"])
    # Admin accesses receipt (200)
    r_receipt_admin = client.get(f"/donations/{don_money_id}/receipt", headers=headers["admin"])

    check(
        "Donation Receipts Generation & Access Control",
        r_receipt_da.status_code == 200 and
        r_receipt_da.json()["receipt_number"].startswith("REC-") and
        r_receipt_db.status_code == 403 and
        r_receipt_oa.status_code == 200 and
        r_receipt_admin.status_code == 200,
        "Receipt generated with unique REC- number; Donor B blocked 403; Owner and Admin allowed 200"
    )

    # ----------------------------------------------------
    # 17. Volunteer Profile CRUD & Constraints
    # ----------------------------------------------------
    # Volunteer A creates profile
    r_create_vol_a = client.post("/volunteers", headers=headers["vol_a"], json={
        "skills": "Counseling, Cooking",
        "availability": "Weekdays",
        "location": "Central City"
    })
    # Duplicate creation for Volunteer A (400)
    r_dup_vol_a = client.post("/volunteers", headers=headers["vol_a"], json={"skills": "Music"})
    # Get & Update profile
    r_get_vol_a = client.get("/volunteers/me", headers=headers["vol_a"])
    r_upd_vol_a = client.put("/volunteers/me", headers=headers["vol_a"], json={"location": "Uptown"})

    check(
        "Volunteer Profile CRUD & Duplicate Prevention",
        r_create_vol_a.status_code == 201 and
        r_dup_vol_a.status_code == 400 and
        r_get_vol_a.status_code == 200 and
        r_upd_vol_a.status_code == 200 and
        r_upd_vol_a.json()["location"] == "Uptown",
        "Volunteer profile created, updated, and duplicate creation rejected with 400"
    )

    # ----------------------------------------------------
    # 18. Events CRUD & Orphanage Ownership Protection
    # ----------------------------------------------------
    # Orphanage A creates event
    r_create_ev = client.post("/events", headers=headers["orph_a"], json={
        "title": "Charity Fun Fair",
        "description": "Annual charity fair with games and food stalls",
        "event_date": "2026-11-20T11:00:00Z",
        "location": "Fairgrounds",
        "status": "upcoming"
    })
    event_id = r_create_ev.json().get("id")

    # Public list & get (no authentication required)
    r_pub_list_ev = client.get("/events")
    r_pub_get_ev = client.get(f"/events/{event_id}")

    # Orphanage B cannot edit Orphanage A event (403)
    r_b_edit_ev = client.put(f"/events/{event_id}", headers=headers["orph_b"], json={"title": "Hacked Title"})
    # Orphanage A updates own event (200)
    r_a_edit_ev = client.put(f"/events/{event_id}", headers=headers["orph_a"], json={"title": "Charity Fun Fair 2026"})

    check(
        "Events CRUD & Public Browsing & Ownership",
        r_create_ev.status_code == 201 and
        r_pub_list_ev.status_code == 200 and
        r_pub_get_ev.status_code == 200 and
        r_b_edit_ev.status_code == 403 and
        r_a_edit_ev.status_code == 200 and
        r_a_edit_ev.json()["title"] == "Charity Fun Fair 2026",
        "Events browseable publicly; Orphanage B blocked with 403; Orphanage A update successful"
    )

    # ----------------------------------------------------
    # 19. Event Participation & Duplicate Prevention
    # ----------------------------------------------------
    # Volunteer A participates (201)
    r_part_a = client.post(f"/events/{event_id}/participate", headers=headers["vol_a"])
    # Volunteer A duplicate participation (400)
    r_part_dup = client.post(f"/events/{event_id}/participate", headers=headers["vol_a"])
    # Donor cannot participate (403)
    r_part_donor = client.post(f"/events/{event_id}/participate", headers=headers["donor_a"])
    # Volunteer A views my participations (200)
    r_my_parts = client.get("/events/my/participations", headers=headers["vol_a"])

    check(
        "Event Participation & Duplicate Rejection",
        r_part_a.status_code == 201 and
        r_part_dup.status_code == 400 and
        r_part_donor.status_code == 403 and
        r_my_parts.status_code == 200 and
        len(r_my_parts.json()) > 0,
        "Participation recorded; duplicate rejected with 400; donor blocked with 403"
    )

    # ----------------------------------------------------
    # 20. Reviews: Rating Validation, Duplicates, and Self-Review
    # ----------------------------------------------------
    # Donor A reviews Orphanage A (201)
    r_rev_da = client.post(f"/orphanages/{orph_a_id}/reviews", headers=headers["donor_a"], json={
        "rating": 5,
        "comment": "Incredible dedication to the kids!"
    })
    # Public reviews listing (no auth)
    r_pub_revs = client.get(f"/orphanages/{orph_a_id}/reviews")

    # Invalid rating > 5 (422)
    r_inv_rating = client.post(f"/orphanages/{orph_a_id}/reviews", headers=headers["donor_b"], json={
        "rating": 6,
        "comment": "Invalid high rating"
    })
    # Duplicate review by Donor A (400)
    r_dup_rev = client.post(f"/orphanages/{orph_a_id}/reviews", headers=headers["donor_a"], json={
        "rating": 4,
        "comment": "Second review"
    })
    # Self-review by Orphanage Owner A (400)
    r_self_rev = client.post(f"/orphanages/{orph_a_id}/reviews", headers=headers["orph_a"], json={
        "rating": 5,
        "comment": "I am reviewing my own orphanage"
    })

    check(
        "Reviews (Validation, Duplicate & Self-Review Prevention)",
        r_rev_da.status_code == 201 and
        r_pub_revs.status_code == 200 and
        r_inv_rating.status_code == 422 and
        r_dup_rev.status_code == 400 and
        r_self_rev.status_code == 400,
        "Review created 201; rating > 5 rejected 422; duplicate rejected 400; self-review rejected 400"
    )

    # ----------------------------------------------------
    # 21. Impact Stories CRUD & Ownership Protection
    # ----------------------------------------------------
    # Orphanage A creates story
    r_create_story = client.post("/impact-stories", headers=headers["orph_a"], json={
        "title": "A Brighter Tomorrow",
        "content": "Our children are thriving thanks to your ongoing contributions.",
        "image_url": "https://example.com/story.png"
    })
    story_id = r_create_story.json().get("id")

    # Public list & get
    r_pub_stories = client.get("/impact-stories")
    r_pub_story = client.get(f"/impact-stories/{story_id}")

    # Orphanage B cannot edit Orphanage A story (403)
    r_b_edit_story = client.put(f"/impact-stories/{story_id}", headers=headers["orph_b"], json={"title": "Hacked Story"})
    # Orphanage A updates own story (200)
    r_a_edit_story = client.put(f"/impact-stories/{story_id}", headers=headers["orph_a"], json={"title": "A Brighter Tomorrow (Updated)"})

    check(
        "Impact Stories CRUD & Ownership Isolation",
        r_create_story.status_code == 201 and
        r_pub_stories.status_code == 200 and
        r_pub_story.status_code == 200 and
        r_b_edit_story.status_code == 403 and
        r_a_edit_story.status_code == 200 and
        r_a_edit_story.json()["title"] == "A Brighter Tomorrow (Updated)",
        "Impact stories publicly visible; Orphanage B blocked 403; Orphanage A update successful"
    )

    # ----------------------------------------------------
    # 22. Notifications & Isolation
    # ----------------------------------------------------
    # Donor A has notification from donation
    r_da_notifs = client.get("/notifications", headers=headers["donor_a"])
    da_notifs = r_da_notifs.json()
    da_notif_id = da_notifs[0]["id"]

    # Donor A marks as read (200)
    r_da_read = client.put(f"/notifications/{da_notif_id}/read", headers=headers["donor_a"])
    # Donor B tries to modify Donor A's notification (403)
    r_db_read = client.put(f"/notifications/{da_notif_id}/read", headers=headers["donor_b"])

    check(
        "Notifications Management & Privacy",
        r_da_notifs.status_code == 200 and
        len(da_notifs) > 0 and
        r_da_read.status_code == 200 and
        r_da_read.json()["is_read"] is True and
        r_db_read.status_code == 403,
        "User views own notifications and marks as read; cross-user modification blocked with 403"
    )

    # ----------------------------------------------------
    # 23. Badges Management & Awarding
    # ----------------------------------------------------
    # Public list badges
    r_pub_badges = client.get("/badges")
    # Admin creates badge
    badge_name = f"Community Champion {unique_run}"
    r_create_badge = client.post("/admin/badges", headers=headers["admin"], json={
        "name": badge_name,
        "description": "Exemplary community supporter",
        "icon": "champion_shield"
    })
    badge_id = r_create_badge.json().get("id")

    # Non-admin cannot create badge (403)
    r_unauth_badge = client.post("/admin/badges", headers=headers["donor_a"], json={"name": "Fake Badge"})

    # Admin awards badge to Donor A
    r_award_badge = client.post(f"/admin/badges/{badge_id}/award/{donor_a_id}", headers=headers["admin"])
    # Duplicate award rejected (400)
    r_dup_award = client.post(f"/admin/badges/{badge_id}/award/{donor_a_id}", headers=headers["admin"])

    # Donor A views own badges (/users/me/badges)
    r_my_badges = client.get("/users/me/badges", headers=headers["donor_a"])
    donor_has_badge = any(b["badge_id"] == badge_id for b in r_my_badges.json())

    check(
        "Badges Management, Awarding & User Badges",
        r_pub_badges.status_code == 200 and
        r_create_badge.status_code == 201 and
        r_unauth_badge.status_code == 403 and
        r_award_badge.status_code == 201 and
        r_dup_award.status_code == 400 and
        donor_has_badge,
        "Admin created badge; non-admin blocked 403; awarded to user; duplicate rejected 400; visible in /users/me/badges"
    )

    # ----------------------------------------------------
    # 24. Admin Statistics
    # ----------------------------------------------------
    r_stats = client.get("/admin/statistics", headers=headers["admin"])
    stats_data = r_stats.json()
    r_unauth_stats = client.get("/admin/statistics", headers=headers["donor_a"])

    check(
        "Admin Statistics Endpoint & Authorization",
        r_stats.status_code == 200 and
        all(k in stats_data for k in ["users", "orphanages", "volunteers", "donations", "requests", "events"]) and
        r_unauth_stats.status_code == 403,
        f"Platform statistics: {stats_data}; non-admin blocked with 403"
    )

    # ----------------------------------------------------
    # 25. Deletion & Cleanup Operations
    # ----------------------------------------------------
    # Orphanage B cannot delete Orphanage A's request, event, or story (403)
    r_b_del_req = client.delete(f"/requests/{item_req_id}", headers=headers["orph_b"])
    r_b_del_ev = client.delete(f"/events/{event_id}", headers=headers["orph_b"])
    r_b_del_story = client.delete(f"/impact-stories/{story_id}", headers=headers["orph_b"])

    # Volunteer A cancels event participation (200)
    r_del_part = client.delete(f"/events/{event_id}/participate", headers=headers["vol_a"])

    # Orphanage A deletes own request, event, and story (200)
    r_a_del_req = client.delete(f"/requests/{item_req_id}", headers=headers["orph_a"])
    r_a_del_ev = client.delete(f"/events/{event_id}", headers=headers["orph_a"])
    r_a_del_story = client.delete(f"/impact-stories/{story_id}", headers=headers["orph_a"])

    check(
        "Resource Deletion & Cross-Orphanage Deletion Protection",
        r_b_del_req.status_code == 403 and
        r_b_del_ev.status_code == 403 and
        r_b_del_story.status_code == 403 and
        r_a_del_req.status_code == 200 and
        r_a_del_ev.status_code == 200 and
        r_a_del_story.status_code == 200 and
        r_del_part.status_code == 200,
        "Cross-orphanage deletion strictly blocked with 403; Owners successfully deleted resources"
    )

    print("\n" + "=" * 60)
    passed_count = sum(1 for _, _, p, _ in test_results if p)
    total_count = len(test_results)
    print(f"VERIFICATION COMPLETE: {passed_count}/{total_count} CHECKS PASSED!")
    print("=" * 60)
    return passed_count, total_count


if __name__ == "__main__":
    passed, total = test_careconnect_backend()
    if passed != total:
        sys.exit(1)
    sys.exit(0)
