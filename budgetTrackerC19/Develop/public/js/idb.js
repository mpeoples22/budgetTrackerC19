let db;
const request = indexedDB.open('budget', 1);
//runs if upgrade needed
request.onugradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStores('new_transaction', { autoIncrement: true});
};
//when online run uplaodTransaction
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.online) {
        uploadTransaction();
    }
};
//if error throw err code
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//holds data while offline

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const trackerObjectStore = transaction.objectStore('new_transaction');
    trackerObjectStore.add(record);
};
//sends data to server when its back online
function uploadTransaction(){
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const trackerObjectStore = transaction.objectStore('new_transaction');
    const getAll = trackerObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0){
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                header: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            
            .then((response) => response.json())
            .then(serverResponse => {
                if (serverResponse.message){
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const trackerObjectStore = transaction.objectStore('new_transaction');
                trackerObjectStore.clear();
                alert('All saved transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};
//listens for server to be back online
window.addEventListener('online', uploadTransactin);
