import{c as F,r as e,u as _,s as c}from"./index-BXWU0Hg5.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=F("Folder",[["path",{d:"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",key:"1kt360"}]]),g=()=>{const[i,u]=e.useState([]),[f,a]=e.useState(!0),{toast:d}=_(),t=e.useCallback(async()=>{try{a(!0);const{data:o,error:l}=await c.from("study_material_folders").select("*").order("name",{ascending:!0});if(l)throw l;const{data:h,error:n}=await c.from("study_materials").select("folder_id").not("folder_id","is",null);if(n)throw n;const m=h.reduce((r,s)=>(s.folder_id&&(r[s.folder_id]=(r[s.folder_id]||0)+1),r),{}),p=o.map(r=>({...r,materialCount:m[r.id]||0}));u(p)}catch(o){console.error("Error fetching folders:",o),d({title:"Error",description:"Failed to load folders",variant:"destructive"})}finally{a(!1)}},[d]);return e.useEffect(()=>{t()},[t]),{folders:i,loading:f,refetchFolders:t}};export{E as F,g as u};
