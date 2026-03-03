export const convertObjectToParams = (filters) => {
  let params = "";
  if (filters)
    Object.keys(filters).map((it) => {
      let val = filters[it];
      val = val === 0 ? "0" : val;
      if (Array.isArray(val)) {
        if (val.length > 0) {
          if (params.indexOf("?") > -1) {
            params += `&${it}=${val}`;
          } else {
            params += `?${it}=${val}`;
          }
        }
      } else if (val || val === false) {
        if (params.indexOf("?") > -1) {
          params += `&${it}=${val}`;
        } else {
          params += `?${it}=${val}`;
        }
      }
      return params;
    });
  return params;
};
