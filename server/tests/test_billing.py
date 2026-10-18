def test_get_invoices(client):
    response = client.get("/api/v1/invoices")
    assert response.status_code == 200
    invoices = response.json()
    assert len(invoices) >= 2


def test_create_invoice_and_gst_calculation(client):
    payload = {
        "invoice_number": "INV-2026-TEST-01",
        "member_id": "mem-201",
        "member_name": "Maya Patel",
        "member_email": "maya.patel@nexuslegal.com",
        "company_name": "Nexus Legal Partners",
        "location_name": "Downtown Hub",
        "issue_date": "2026-10-18",
        "due_date": "2026-10-25",
        "status": "Open",
        "currency": "INR",
        "subtotal_cents": 2000000,  # ₹20,000
        "tax_rate_percent": 18,
        "tax_amount_cents": 360000,  # ₹3,600 (18%)
        "total_amount_cents": 2360000,  # ₹23,600
        "line_items": [
            {
                "description": "Additional Conference Hall Access (4 hours)",
                "quantity": 1,
                "unit_price_cents": 2000000,
                "amount_cents": 2000000,
            }
        ],
    }
    response = client.post("/api/v1/invoices", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["invoice_number"] == "INV-2026-TEST-01"
    assert data["tax_amount_cents"] == 360000
    assert data["total_amount_cents"] == 2360000
    assert data["paid_amount_cents"] == 0
    assert data["status"] == "Open"


def test_record_payment_reconciliation(client):
    # inv-702 is overdue with ₹16,520 (1,652,000 cents) unpaid
    # 1. Partial payment
    partial_payment = {
        "amount_cents": 652000,  # ₹6,520
        "payment_method": "UPI / NetBanking",
        "transaction_ref": "UPI-PARTIAL-TEST",
        "paid_at": "2026-10-18",
        "notes": "Partial installment via UPI",
    }
    resp1 = client.post("/api/v1/invoices/inv-702/payments", json=partial_payment)
    assert resp1.status_code == 200
    inv_data = resp1.json()
    assert inv_data["paid_amount_cents"] == 652000
    assert inv_data["status"] == "Partially Paid"

    # 2. Final payment to complete invoice
    remaining_payment = {
        "amount_cents": 1000000,  # ₹10,000
        "payment_method": "Bank Transfer",
        "transaction_ref": "NEFT-FINAL-TEST",
        "paid_at": "2026-10-18",
        "notes": "Final settlement",
    }
    resp2 = client.post("/api/v1/invoices/inv-702/payments", json=remaining_payment)
    assert resp2.status_code == 200
    completed_inv = resp2.json()
    assert completed_inv["paid_amount_cents"] == 1652000
    assert completed_inv["status"] == "Paid"


def test_send_invoice_reminder(client):
    response = client.post("/api/v1/invoices/inv-701/send-reminder")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "dispatched" in response.json()["message"]
