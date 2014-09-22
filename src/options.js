function save_options() {
    var unit = $('input[name="unit"]:checked').val();
    var home = $('#home').val();
    console.log("Saving");
    console.log(unit);
    console.log(home);
    chrome.storage.sync.set({
        unit: unit,
        home: home
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        unit: 'imperial',
        home: ''
    }, function(items) {
        $('input:radio[name="unit"][value='+items.unit+']').prop('checked', true);
        $('#home').val(items.home);
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);