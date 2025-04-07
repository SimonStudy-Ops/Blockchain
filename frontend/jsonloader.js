function loadJson(endpoint) {
    const heading = document.createElement('h1');
    heading.innerText = `JSON from ${endpoint}`;

    const loader = document.createElement('p');
    loader.innerText = 'Loading...';
    loader.setAttribute('class', 'loader');

    const section = document.createElement('section');
    section.appendChild(heading);
    section.appendChild(loader);
    document.querySelector('body').appendChild(section);
    const replaceLoaderTime = Date.now() + 400;

    fetch(endpoint)
    .then((response) => response.text())
    .then((text) => {
        const tree = jsonview.create(text);
        const treeContainer = document.createElement('div');
        jsonview.render(tree, treeContainer);
        jsonview.expand(tree);
        setTimeout(() => {
            section.removeChild(loader);
            section.appendChild(treeContainer);
        }, Math.max(0, replaceLoaderTime - Date.now()));
    })
    .catch((error) => {
        loader.innerText = 'Failed to load JSON: ' + error;
    });
}
