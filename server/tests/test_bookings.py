def test_get_spaces(client):
    response = client.get("/api/v1/spaces")
    assert response.status_code == 200
    spaces = response.json()
    assert len(spaces) >= 4
    assert any(s["name"] == "Oak Boardroom" for s in spaces)


def test_create_booking_success(client):
    payload = {
        "space_id": "space-402",  # Cedar Huddle
        "space_name": "Cedar Huddle",
        "location_name": "Downtown Hub",
        "title": "Design Sprint Retro",
        "booking_type": "Meeting Room",
        "booked_by_name": "Marcus Vance",
        "booked_by_email": "marcus@worknest.space",
        "date": "2026-10-25",
        "start_time": "11:00",
        "end_time": "12:30",  # 1.5 hours
        "attendees_count": 3,
    }
    response = client.post("/api/v1/bookings", json=payload)
    assert response.status_code == 201
    booking = response.json()
    assert booking["title"] == "Design Sprint Retro"
    assert booking["status"] == "Confirmed"
    # Hourly rate for Cedar Huddle is ₹500 (50,000 cents) -> 1.5h = 75,000 cents
    assert booking["total_cost_cents"] == 75000


def test_booking_conflict_prevention(client):
    # In seed data, Oak Boardroom (space-401) is booked from 14:00 to 16:00 on 2026-10-20
    # 1. Check conflict endpoint
    check_resp = client.post(
        "/api/v1/bookings/check-conflict",
        json={
            "space_id": "space-401",
            "date": "2026-10-20",
            "start_time": "14:30",
            "end_time": "15:30",
        },
    )
    assert check_resp.status_code == 200
    assert check_resp.json()["has_conflict"] is True
    assert check_resp.json()["conflicting_booking"] is not None

    # 2. Attempting to book overlapping slot returns 409 Conflict
    conflict_payload = {
        "space_id": "space-401",
        "space_name": "Oak Boardroom",
        "location_name": "Downtown Hub",
        "title": "Conflicting Board Meeting",
        "booking_type": "Meeting Room",
        "booked_by_name": "Sarah Jenkins",
        "booked_by_email": "sarah@worknest.space",
        "date": "2026-10-20",
        "start_time": "15:00",
        "end_time": "17:00",
    }
    create_resp = client.post("/api/v1/bookings", json=conflict_payload)
    assert create_resp.status_code == 409
    assert "collision" in create_resp.json()["detail"].lower()


def test_booking_cancellation(client):
    cancel_resp = client.post("/api/v1/bookings/book-601/cancel")
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "Cancelled"

    # Once cancelled, that slot should no longer conflict!
    check_resp = client.post(
        "/api/v1/bookings/check-conflict",
        json={
            "space_id": "space-401",
            "date": "2026-10-20",
            "start_time": "14:00",
            "end_time": "16:00",
        },
    )
    assert check_resp.status_code == 200
    assert check_resp.json()["has_conflict"] is False
