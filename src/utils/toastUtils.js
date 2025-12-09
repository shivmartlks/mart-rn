import Toast from "react-native-toast-message";

export const showSuccess = (text1, text2 = "") => {
  Toast.show({
    type: "success",
    text1,
    text2,
  });
};

export const showError = (text1, text2 = "") => {
  Toast.show({
    type: "error",
    text1,
    text2,
  });
};

export const showInfo = (text1, text2 = "") => {
  Toast.show({
    type: "info",
    text1,
    text2,
  });
};
