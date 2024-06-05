import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showSuccessToastMessage = (message) => {
  toast.success(message);
};

export const showErrorToastMessage = (message) => {
  toast.error(message);
};
