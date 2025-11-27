import { configure } from "vee-validate";

export default function setupVeeValidate() {
  configure({
    validateOnMount: false,
    validateOnBlur: true,
    validateOnInput: false,
    validateOnChange: true,
    validateOnModelUpdate: false,
    validateOnSubmit: true,
  });
}
