export const convertToUpperCamelCase = str => {
    if (str) {
      str = str.toLowerCase().replace(/_/g, ' ')
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  }