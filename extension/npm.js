'use strict';

console.log('hello world from content.js');

function escapePackageName(pkg) {
  // npm registry expects the slashes in the (scoped) package names to be sent
  // escaped.
  return pkg.replace('/', '%2f');
}

async function init() {
  const [matches, pkg] = location.href.match(/http.*:\/\/.*npmjs.com\/package\/(.*)/);
  if (!matches) {
    return;
  }
  const encodedPackage = escapePackageName(pkg);

  const response = await fetch(`https://registry.npmjs.com/${encodedPackage}`);
  if (response.ok) {
    const manifest = await response.json();
    const latestVersion = manifest['dist-tags'].latest;
    const latestManifest = manifest.versions[latestVersion];

    let friendliness = '🤷';
    if (latestManifest.types || latestManifest.typings) {
      friendliness = '😍';
    } else {
      // Perhaps there is a @types/ package for this module.
      const typesPackageName = escapePackageName(`@types/${encodedPackage}`);
      const response = await fetch(`https://registry.npmjs.com/${typesPackageName}`);
      if (response.ok) {
        const typesManifest = await response.json();
        friendliness = '😊';
      }
    }

    const textNode = document.createTextNode(`TS Friendliness: ${friendliness}`);
    // const box0 = document.getElementsByClassName('package__sidebar')[0];
    // box0.appendChild(textNode);
    const matches = document.querySelectorAll('div[class^="package__rightSidebar__"');
    if (matches.length === 1) {
      const sideBar = matches[0];
      sideBar.appendChild(textNode);
    }
  } else {
    console.log('fetch response was not ok');
  }
}

init();