import React from 'react';
import { createRoot } from 'react-dom/client';

import { queryScryfallSearch } from 'lib/api/queryScryfallSearch';
import Outlet from './Outlet';

(async function() {
  const selection = getSelection().toString()

  if (!selection.trim()) return

  const result = await queryScryfallSearch({ name : selection })

  if ("error" in result) return;

  let container = document.getElementById('content-script-outlet')

  if (!container) {
    container = document.createElement('div')
    container.id = 'content-script-outlet'
  }

  document.body.insertBefore(container, document.body.firstChild)

  const root = createRoot(document.getElementById('content-script-outlet'))

  // console.log(`
  //     $$$
  //         RENDER <OUTLET response={${result[0].name}}></OUTLET>
  //         json: ${JSON.stringify(result, null, 4)}
  //     $$$
  // `);

  root.render(<>
    <Outlet response={result}></Outlet>
  </>)
})()
