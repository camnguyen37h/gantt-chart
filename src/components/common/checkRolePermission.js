
export const checkRolePermission = (key, ...activities ) => {
  const listAllRolePermission =
    JSON.parse(localStorage.getItem('permissions')) || [];
  for (let i = 0; i < listAllRolePermission.length; i++) {
    if (listAllRolePermission[i].key === key) {
      if (Array.isArray(listAllRolePermission[i].activities) && listAllRolePermission[i].activities.length){
        for (let j = 0; j < listAllRolePermission[i].activities.length; j++){
          if (activities.includes(listAllRolePermission[i].activities[j].name)) {
            return true;
        }  
      }
      }
    }
  }
  return false;
};
