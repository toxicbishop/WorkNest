from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.leads import router as leads_router
from app.api.v1.activities import router as activities_router
from app.api.v1.members import router as members_router
from app.api.v1.spaces import router as spaces_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.settings import router as settings_router
from app.api.v1.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(leads_router)
api_router.include_router(activities_router)
api_router.include_router(members_router)
api_router.include_router(spaces_router)
api_router.include_router(bookings_router)
api_router.include_router(invoices_router)
api_router.include_router(settings_router)
api_router.include_router(dashboard_router)
