import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end", // top-end, bottom-start, center...
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export default Toast;
