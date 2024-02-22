from user.models import Friend

def is_visible(visibility,owner_id,is_login,user):
    if visibility == 0:
        return True
    if visibility == 1:
        if is_login:
            return True
    if not is_login:
        return False
    
    if owner_id == user.id:
        return True
    
    if visibility == 2:
        if Friend.objects.filter(from_user_id=owner_id,to_user_id=user.id).count() !=0:
            return True
    return False