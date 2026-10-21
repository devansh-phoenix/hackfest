from rest_framework import permissions
from .models import ShopMembership

class IsShopMember(permissions.BasePermission):
    """
    Ensures that the authenticated user is an active member of the shop
    specified by `shop_id` or `pk` in the URL kwargs.
    Cross-shop access is strictly forbidden.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        shop_id = view.kwargs.get('shop_id') or view.kwargs.get('pk')
        if not shop_id:
            return True

        return ShopMembership.objects.filter(
            shop_id=shop_id,
            user=request.user
        ).exists()

class IsShopOwner(permissions.BasePermission):
    """
    Requires the user to have the 'owner' role in the specified shop.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        shop_id = view.kwargs.get('shop_id') or view.kwargs.get('pk')
        if not shop_id:
            return True

        return ShopMembership.objects.filter(
            shop_id=shop_id,
            user=request.user,
            role='owner'
        ).exists()
