def test_dashboard_metrics(client):
    response = client.get("/api/v1/dashboard/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert "activeMembers" in metrics
    assert "openLeads" in metrics
    assert "toursScheduledThisWeek" in metrics
    assert "mrrCents" in metrics
    assert "pipelineCounts" in metrics
    assert metrics["isDemoData"] is False
    assert metrics["activeMembers"] >= 2
    assert metrics["mrrCents"] > 0


def test_dashboard_notifications(client):
    response = client.get("/api/v1/dashboard/notifications")
    assert response.status_code == 200
    notifs = response.json()
    assert "items" in notifs
    assert "unread_count" in notifs
    assert isinstance(notifs["items"], list)


def test_dashboard_analytics(client):
    response = client.get("/api/v1/dashboard/analytics")
    assert response.status_code == 200
    analytics = response.json()
    assert "occupancy" in analytics
    assert "conversion" in analytics
    assert "utilization" in analytics
    assert "revenue" in analytics
    assert len(analytics["occupancy"]) >= 3
    assert analytics["conversion"]["total_leads"] >= 5
    assert analytics["conversion"]["conversion_rate_percent"] >= 0.0
    assert analytics["revenue"]["retention_rate_percent"] > 0.0
