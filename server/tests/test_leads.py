def test_get_leads(client):
    response = client.get("/api/v1/leads")
    assert response.status_code == 200
    leads = response.json()
    assert len(leads) >= 3
    assert any(lead["name"] == "Elena Rostova" for lead in leads)


def test_create_lead_success(client):
    payload = {
        "name": "Ananya Roy",
        "email": "ananya@quantumleap.tech",
        "phone": "+91 99001 12233",
        "company": "QuantumLeap AI",
        "interested_plan": "Private Office",
        "preferred_location": "Downtown Hub",
        "team_size": 6,
        "source": "Website Form",
        "notes": "Looking for high-security corner office.",
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Ananya Roy"
    assert data["status"] == "New"
    assert len(data["activities"]) >= 1  # Auto-generated follow-up activity
    assert len(data["audit_logs"]) >= 1


def test_create_lead_duplicate_rejection(client):
    # Elena Rostova is already in the seed data
    payload = {
        "name": "Elena Duplicate",
        "email": "elena@lumina-ai.dev",
        "phone": "+91 98201 23456",
        "interested_plan": "Private Office",
        "preferred_location": "Downtown Hub",
    }
    response = client.post("/api/v1/leads", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_lead_status_update_lost_requires_reason(client):
    # Transition to Lost without reason must fail per PRD 6.2
    response = client.patch(
        "/api/v1/leads/lead-102/status",
        json={"status": "Lost", "reason": ""},
    )
    assert response.status_code == 400
    assert "mandatory" in response.json()["detail"].lower()

    # Transition with valid reason succeeds
    response = client.patch(
        "/api/v1/leads/lead-102/status",
        json={"status": "Lost", "reason": "Chose competitor with specialized hardware lab."},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Lost"
    assert response.json()["lost_reason"] == "Chose competitor with specialized hardware lab."


def test_lead_conversion_to_member(client):
    convert_payload = {
        "plan": "Hot Desk",
        "start_date": "2026-11-01",
        "billing_interval": "Monthly",
        "desk_or_office_number": "Hot Desk Bay C",
    }
    response = client.post("/api/v1/leads/lead-101/convert", json=convert_payload)
    assert response.status_code == 200
    member_data = response.json()
    assert member_data["name"] == "Elena Rostova"
    assert member_data["email"] == "elena@lumina-ai.dev"
    assert member_data["status"] == "Active"
    assert len(member_data["memberships"]) >= 1
    assert member_data["memberships"][0]["plan_code"] == "Hot Desk"

    # Verify lead status is now Converted
    lead_resp = client.get("/api/v1/leads/lead-101")
    assert lead_resp.status_code == 200
    assert lead_resp.json()["status"] == "Converted"
    assert lead_resp.json()["converted_member_id"] == member_data["id"]
