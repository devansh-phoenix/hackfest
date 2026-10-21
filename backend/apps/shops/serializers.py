from rest_framework import serializers
from .models import Shop, ShopMembership

class ShopSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = ['id', 'name', 'phone', 'address', 'role', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'role']

    def get_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            return membership.role if membership else None
        return None

class ShopMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ShopMembership
        fields = ['id', 'shop', 'user', 'username', 'user_email', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']
