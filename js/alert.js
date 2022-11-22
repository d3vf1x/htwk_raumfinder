function messageSuccess(msg) {
    const message = document.getElementById("alert");
    message.hidden = false;
    message.classList.remove("alert-success", "alert-danger", "alert-warning");
    message.classList.add("alert-success");
    message.innerHTML = msg
}

function messageFail(msg) {
    const alert = document.getElementById("alert");
    alert.hidden = false;
    alert.classList.remove("alert-success", "alert-danger", "alert-warning");
    alert.classList.add("alert-danger");
    alert.innerHTML = msg
}

function messagewarning(msg) {
    const alert = document.getElementById("alert");
    alert.hidden = false;
    alert.classList.remove("alert-success", "alert-danger", "alert-warning");
    alert.classList.add("alert-warning");
    alert.innerHTML = msg;
}