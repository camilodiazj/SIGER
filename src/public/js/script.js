function check() {
    if (document.getElementById("request").value == "default") {
        document.getElementById("request").setCustomValidity("Selecciona el tipo de solicitud");
    } else {
        document.getElementById("request").setCustomValidity("");
    }
    if (document.getElementById("program").value == "0") {
        document.getElementById("program").setCustomValidity("Selecciona el programa");
    } else {
        document.getElementById("program").setCustomValidity("");
    }
}
document.getElementById("btn").onclick = check;
document.getElementById("request").onchange = check;
document.getElementById("program").onchange = check;

$(function () {
    $('#program').change(function () {
        var program = document.getElementById("program").value;
        console.log(program);
        $.ajax({
            type: 'POST',
            data: { program },
            url: '/admin/subject',
            success: function (data) {
                var option = $('#subject');
                option.html('');
                data.forEach(dat => {
                    option.append(`<option value="${dat.subject_id}">${dat.subject_name}</option>`);
                })
            }
        })
    });
});