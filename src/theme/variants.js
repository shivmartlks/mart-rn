// src/theme/variants.js

import colors from "./colors";

export const variants = {
  card: {
    default: {
      backgroundColor: colors.white50,
      borderColor: colors.gray200,
    },
    success: {
      backgroundColor: colors.green50,
      borderColor: colors.green200,
    },
    danger: {
      backgroundColor: colors.red50,
      borderColor: colors.red200,
    },
    warning: {
      backgroundColor: colors.orange50,
      borderColor: colors.orange200,
    },
  },
};

export default variants;
