listContainers()
async function listContainers() {
    const response =  await fetch("/containers");
    const data = await response.json();

    containerTable(document.querySelector("table.other"), data.other)
    containerTable(document.querySelector("table.dynamic"), data.dynamic)
    containerTable(document.querySelector("table.static"), data.static)
}

function containerTable(table, data) {
    const body = table.querySelector("tbody");
    body.innerHTML = "";

    data.forEach((item) => {
        body.innerHTML += `<tr>
                                <td>${item.name}</td>
                                <td>${item.ip}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="removeContainer('${item.id}')">Stop</button>
                                </td>
                            </tr>`
    });
}

async function removeContainer(id){
    const response =  await fetch(`/stop/${id}`);
    const data = await response.json();
    listContainers();
}

async function addDynamic() {
    const response =  await fetch("/add/dynamic");
    const data = await response.json();
    listContainers();
}

async function addStatic() {
    const response =  await fetch("/add/static");
    const data = await response.json();

    listContainers();
}