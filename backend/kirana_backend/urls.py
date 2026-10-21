from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.shops.views import ShopViewSet
from apps.inventory.views import (
    ProductViewSet,
    AddStockView,
    StockCorrectionView,
    StockMovementListView
)
from apps.sales.views import SaleListCreateView
from apps.sync.views import BatchSyncView

router = DefaultRouter()
router.register(r'shops', ShopViewSet, basename='shop')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('api/v1/auth/', include('apps.accounts.urls')),

    # Shops (Root)
    path('api/v1/', include(router.urls)),

    # Nested Shop-specific endpoints
    path('api/v1/shops/<uuid:shop_id>/products/', ProductViewSet.as_view({'get': 'list', 'post': 'create'}), name='shop-products-list'),
    path('api/v1/shops/<uuid:shop_id>/products/<uuid:pk>/', ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='shop-products-detail'),
    
    # Inventory actions
    path('api/v1/shops/<uuid:shop_id>/inventory/add-stock/', AddStockView.as_view(), name='shop-inventory-add-stock'),
    path('api/v1/shops/<uuid:shop_id>/inventory/correct-stock/', StockCorrectionView.as_view(), name='shop-inventory-correct-stock'),
    path('api/v1/shops/<uuid:shop_id>/inventory/movements/', StockMovementListView.as_view(), name='shop-inventory-movements'),

    # Sales
    path('api/v1/shops/<uuid:shop_id>/sales/', SaleListCreateView.as_view(), name='shop-sales-list-create'),

    # Batch Sync with Idempotency
    path('api/v1/shops/<uuid:shop_id>/sync/batch/', BatchSyncView.as_view(), name='shop-sync-batch'),
]
