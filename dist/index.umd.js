(function(h,L){typeof exports=="object"&&typeof module<"u"?L(require("@fiftyone/plugins"),require("@mui/material"),require("@fiftyone/components"),require("@fiftyone/operators"),require("@fiftyone/state"),require("react"),require("recoil"),require("styled-components")):typeof define=="function"&&define.amd?define(["@fiftyone/plugins","@mui/material","@fiftyone/components","@fiftyone/operators","@fiftyone/state","react","recoil","styled-components"],L):(h=typeof globalThis<"u"?globalThis:h||self,L(h.__fop__,h.__mui__,h.__foc__,h.__foo__,h.__fos__,h.React,h.recoil,h.__styled__))})(this,function(h,L,ue,C,fe,d,l,i){"use strict";function pe(e){const t=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const n in e)if(n!=="default"){const o=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(t,n,o.get?o:{enumerable:!0,get:()=>e[n]})}}return t.default=e,Object.freeze(t)}const U=pe(fe),J=l.atom({key:"hsiVisualizerImage_v1",default:null}),Q=l.atom({key:"hsiVisualizerSampleId_v1",default:null}),ee=l.atom({key:"hsiVisualizerSpectrum_v1",default:null}),j=l.atom({key:"hsiVisualizerLoading_v1",default:!1}),H=l.atom({key:"hsiVisualizerWavelengths_v1",default:[]}),T=l.atom({key:"hsiVisualizerRgbBands_v1",default:{r:27,g:16,b:6}}),te=l.atom({key:"hsiVisualizerChannelMode_v1",default:"rgb"}),ne=l.atom({key:"hsiVisualizerGrayBand_v1",default:16});function me(e){let t=0,n=0,o=0,s=1;if(e>=380&&e<440)t=-(e-440)/60,n=0,o=1,s=.3+.7*(e-380)/60;else if(e<490)t=0,n=(e-440)/50,o=1;else if(e<510)t=0,n=1,o=-(e-510)/20;else if(e<580)t=(e-510)/70,n=1,o=0;else if(e<645)t=1,n=-(e-645)/65,o=0;else if(e<=780)t=1,n=0,o=0,s=e>700?.3+.7*(780-e)/80:1;else{const R=Math.min((e-780)/1700,1),c=Math.round(220-150*R),g=Math.round(100-70*R),r=Math.round(120+60*R);return`rgb(${c},${g},${r})`}return`rgb(${Math.round(255*t*s)},${Math.round(255*n*s)},${Math.round(255*o*s)})`}function xe(e,t){return[380,420,440,460,490,510,540,580,610,645,700,780,900,1200,1600,2480].filter(o=>o>=e&&o<=t).map(o=>({offset:`${((o-e)/(t-e)*100).toFixed(1)}%`,color:me(o)}))}const ge=i.div`
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`,he=i.div`
  display: flex;
  flex-direction: row;
  gap: 0.75em;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`,be=i.div`
  flex: 0 0 45%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
`,Re=i.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
`,ye=i.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: crosshair;
`,ve=i.div`
  position: relative;
  width: 100%;
  height: 100%;
`,_e=i.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  display: block;
  cursor: crosshair;
  border-radius: 4px;
  border: 1px solid #333;
`,Se=i.div`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #f87171;
  transform: translate(-50%, -50%);
  pointer-events: none;
  left: ${({x:e})=>e}px;
  top: ${({y:e})=>e}px;
`,ke=i.div`
  background: #111;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  padding: 10px;
  flex: 1;
`,Ee=i.div`
  color: #555;
  font-size: 12px;
  font-style: italic;
`,we=i.div`
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: #ccc;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;
  z-index: 10;
`,Ce=i.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 6px 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
`,ze=i.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
`,oe=i.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
`,ae=i.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({color:e})=>e};
  flex-shrink: 0;
`,re=i.input`
  flex: 1;
  min-width: 40px;
  accent-color: ${({$color:e})=>e};
  cursor: pointer;
`,le=i.span`
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 64px;
`,Me=i.span`
  font-size: 10px;
  color: #555;
  white-space: nowrap;
  flex-shrink: 0;
`;i.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;const $e=i.div`
  display: flex;
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
`,ie=i.button`
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  background: ${({$active:e})=>e?"#3f3f46":"#1a1a1a"};
  color: ${({$active:e})=>e?"#fff":"#666"};
  &:hover { background: #3f3f46; color: #fff; }
`,Be=i.button`
  width: 64px;
  height: 26px;
  background: #ff6d04;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover:not(:disabled) { background: #e05c00; }
  &:disabled { opacity: 0.6; cursor: default; }
`,Ie=i.button`
  width: 52px;
  height: 26px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #999;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: #3f3f46; color: #fff; border-color: #555; }
`;function Ae({wavelengths:e,intensities:t,bandLines:n=[],loading:o=!1}){const c={top:10,right:10,bottom:28,left:44},g=460-c.left-c.right,r=140-c.top-c.bottom,b=!t||t.length===0,y=e[0],z=e[e.length-1],S=b?0:Math.min(...t),v=(b?1:Math.max(...t))-S||1,m=a=>(a-y)/(z-y)*g,_=a=>r-(a-S)/v*r,u=xe(y,z),E="spectrumGrad",x=[0,.25,.5,.75,1].map(a=>({wl:Math.round(y+a*(z-y)),x:a*g})),I=b?[0,.5,1].map(a=>({val:"—",y:r-a*r})):[0,.5,1].map(a=>{const f=S+a*v;return{val:f>100?f.toFixed(0):f.toFixed(1),y:r-a*r}});return React.createElement("svg",{viewBox:"0 0 460 140",preserveAspectRatio:"xMidYMid meet",style:{width:"100%",height:"100%"}},React.createElement("defs",null,React.createElement("linearGradient",{id:E,x1:"0",y1:"0",x2:"1",y2:"0"},u.map((a,f)=>React.createElement("stop",{key:f,offset:a.offset,stopColor:a.color})))),React.createElement("g",{transform:`translate(${c.left},${c.top})`},b&&!o&&React.createElement("text",{x:g/2,y:r/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#555",fontSize:11},"Click a pixel to view its spectrum"),b&&o&&React.createElement("text",{x:g/2,y:r/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#ff6d04",fontSize:11},"Loading spectrum…",React.createElement("animate",{attributeName:"opacity",values:"1;0.3;1",dur:"1.4s",repeatCount:"indefinite"})),n.map((a,f)=>{if(a.bandIdx<0||a.bandIdx>=e.length)return null;const M=m(e[a.bandIdx]);return React.createElement("g",{key:f},React.createElement("line",{x1:M,y1:0,x2:M,y2:r,stroke:a.color,strokeWidth:1,strokeDasharray:"4 3",opacity:.6}),React.createElement("text",{x:M,y:-2,textAnchor:"middle",fill:a.color,fontSize:8},a.label))}),!b&&React.createElement("polyline",{points:t.map((a,f)=>`${m(e[f])},${_(a)}`).join(" "),fill:"none",stroke:`url(#${E})`,strokeWidth:2,strokeLinejoin:"round",opacity:o?.25:1}),!b&&o&&React.createElement("text",{x:g/2,y:r/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#ff6d04",fontSize:10},"Loading spectrum…",React.createElement("animate",{attributeName:"opacity",values:"1;0.3;1",dur:"1.4s",repeatCount:"indefinite"})),React.createElement("line",{x1:0,y1:r,x2:g,y2:r,stroke:"#444",strokeWidth:1}),x.map((a,f)=>React.createElement("g",{key:f,transform:`translate(${a.x},${r})`},React.createElement("line",{y2:4,stroke:"#444",strokeWidth:1}),React.createElement("text",{y:14,textAnchor:"middle",fill:"#666",fontSize:9},a.wl))),React.createElement("text",{x:g/2,y:r+26,textAnchor:"middle",fill:"#444",fontSize:9},"Wavelength (nm)"),React.createElement("line",{x1:0,y1:0,x2:0,y2:r,stroke:"#444",strokeWidth:1}),React.createElement("text",{transform:`translate(${-c.left+10},${r/2}) rotate(-90)`,textAnchor:"middle",fill:"#444",fontSize:9},"Intensity"),I.map((a,f)=>React.createElement("g",{key:f,transform:`translate(0,${a.y})`},React.createElement("line",{x1:-4,stroke:"#444",strokeWidth:1}),React.createElement("text",{x:-6,textAnchor:"end",dominantBaseline:"middle",fill:"#444",fontSize:8},a.val)))))}const We=[{key:"r",color:"#f87171",label:"R"},{key:"g",color:"#4ade80",label:"G"},{key:"b",color:"#60a5fa",label:"B"}];function Le({sampleId:e,spectrum:t,onClear:n}){const o=l.useRecoilValue(H),[s,R]=l.useRecoilState(T),[c,g]=l.useRecoilState(ne),[r,b]=l.useRecoilState(te),[y,z]=l.useRecoilState(j),S=o.length>0?o.length-1:199,k=m=>{var _;return o.length>0?`${(_=o[m])==null?void 0:_.toFixed(0)}nm`:`#${m}`},v=d.useCallback(()=>{e&&(z(!0),r==="rgb"?C.executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image",{sample_id:e,r_band:s.r,g_band:s.g,b_band:s.b}):C.executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image",{sample_id:e,r_band:c,g_band:c,b_band:c}))},[e,r,s,c]);return React.createElement(Ce,null,React.createElement($e,null,React.createElement(ie,{$active:r==="rgb",onClick:()=>b("rgb")},"RGB"),React.createElement(ie,{$active:r==="gray",onClick:()=>b("gray")},"Gray")),React.createElement(ze,null,r==="rgb"?We.map(({key:m,color:_,label:u})=>React.createElement(oe,{key:m},React.createElement(ae,{color:_}),React.createElement(le,{style:{color:_}},u,": ",k(s[m])),React.createElement(re,{type:"range",$color:_,min:0,max:S,value:s[m],onChange:E=>R(x=>({...x,[m]:Number(E.target.value)}))}))):React.createElement(oe,null,React.createElement(ae,{color:"#aaa"}),React.createElement(le,{style:{color:"#aaa"}},"Band: ",k(c)),React.createElement(re,{type:"range",$color:"#aaa",min:0,max:S,value:c,onChange:m=>g(Number(m.target.value))}))),e&&React.createElement(Be,{onClick:v,disabled:y},y?React.createElement(ue.LoadingSpinner,{size:"small",color:"base"}):"Render"),t&&React.createElement(Ie,{onClick:n},"Clear"),t&&React.createElement(Me,null,"(",t.pixel_x,", ",t.pixel_y,")"))}function Pe(){const e=l.useRecoilValue(U.dataset),[t,n]=l.useRecoilState(J),[o]=l.useRecoilState(Q),[s,R]=l.useRecoilState(j),c=l.useRecoilValue(H),[,g]=l.useRecoilState(H),[r,b]=l.useRecoilState(ee),y=l.useRecoilValue(T),z=l.useRecoilValue(ne),S=l.useRecoilValue(te),k=l.useRecoilValue(U.currentSampleId),v=d.useRef(null),m=d.useRef(null),_=d.useRef(null),[u,E]=d.useState(1),[x,I]=d.useState({x:0,y:0}),a=d.useRef(!1),f=d.useRef({x:0,y:0}),M=d.useRef({x:0,y:0});d.useEffect(()=>{!e||!k||k!==o&&(n(null),b(null),g([]),v.current=null,E(1),I({x:0,y:0}),R(!0),C.executeOperator("@ehofesmann/envi-spectral-viewer/load_hsi_image",{sample_id:k}))},[k,e]);const He=d.useCallback(p=>{p.preventDefault();const w=m.current;if(!w)return;const $=w.getBoundingClientRect(),B=p.clientX-$.left,O=p.clientY-$.top,P=u,q=p.deltaY>0?-.15:.15,V=Math.min(Math.max(P+q*P,1),15),A=V/P,D=B-A*(B-x.x),W=O-A*(O-x.y);E(V),I(V<=1?{x:0,y:0}:{x:D,y:W})},[u,x]),Oe=d.useCallback(p=>{u<=1||(p.button===1||p.altKey)&&(p.preventDefault(),a.current=!0,f.current={x:p.clientX,y:p.clientY},M.current={...x})},[u,x]),Ge=d.useCallback(p=>{if(!a.current)return;const w=p.clientX-f.current.x,$=p.clientY-f.current.y;I({x:M.current.x+w,y:M.current.y+$})},[]),ce=d.useCallback(()=>{a.current=!1},[]),Ye=d.useCallback(()=>{E(1),I({x:0,y:0}),v.current=null},[]),Xe=d.useCallback(()=>{b(null),v.current=null},[]),je=d.useCallback(p=>{if(!o||a.current||p.altKey)return;const w=_.current,$=m.current;if(!w||!$)return;const B=$.getBoundingClientRect(),O=p.clientX-B.left,P=p.clientY-B.top,q=(O-x.x)/u,V=(P-x.y)/u,A=w.naturalWidth,D=w.naturalHeight,W=A/D,G=B.width,N=B.height,se=G/N,F=W>se?G:N*W,de=W>se?G/W:N,qe=(G-F)/2,Ne=0,Y=q-qe,X=V-Ne;if(Y<0||Y>F||X<0||X>de)return;const Z=Math.round(Y/F*A),K=Math.round(X/de*D);if(Z<0||Z>=A||K<0||K>=D)return;const Fe=Y*u+x.x,Ze=X*u+x.y;v.current={x:Fe,y:Ze},R(!0),C.executeOperator("@ehofesmann/envi-spectral-viewer/get_spectral_profile",{sample_id:o,pixel_x:Z,pixel_y:K})},[o,u,x]),Te=r?S==="rgb"?[{bandIdx:y.r,color:"#f87171",label:"R"},{bandIdx:y.g,color:"#4ade80",label:"G"},{bandIdx:y.b,color:"#60a5fa",label:"B"}]:[{bandIdx:z,color:"#aaa",label:"Gray"}]:[];return React.createElement(ge,null,React.createElement(he,null,React.createElement(be,null,s&&!t&&React.createElement(Ee,null,"Loading…"),t&&React.createElement(ye,{ref:m,onWheel:He,onMouseDown:Oe,onMouseMove:Ge,onMouseUp:ce,onMouseLeave:ce,onDoubleClick:Ye,title:u>1?"Scroll to zoom · Alt+drag to pan · Double-click to reset":"Scroll to zoom · Click a pixel for spectral profile"},u>1&&React.createElement(we,null,u.toFixed(1),"×"),React.createElement(ve,{style:{transform:`translate(${x.x}px, ${x.y}px) scale(${u})`,transformOrigin:"0 0"}},React.createElement(_e,{ref:_,src:t,alt:"HSI pseudo-RGB",onClick:je,draggable:!1})),v.current&&r&&React.createElement(Se,{x:v.current.x,y:v.current.y}))),React.createElement(Re,null,c.length>0&&React.createElement(ke,null,React.createElement(Ae,{wavelengths:c,intensities:r==null?void 0:r.intensities,bandLines:Te,loading:s&&!!t})))),React.createElement(Le,{sampleId:o,spectrum:r,onClear:Xe}))}class Ve extends C.Operator{get config(){return new C.OperatorConfig({name:"show_hsi_data",label:"Show HSI Data",unlisted:!0})}useHooks(){return{setImage:l.useSetRecoilState(J),setSampleId:l.useSetRecoilState(Q),setSpectrum:l.useSetRecoilState(ee),setLoading:l.useSetRecoilState(j),setWavelengths:l.useSetRecoilState(H),setRgbBands:l.useSetRecoilState(T)}}async execute({hooks:t,params:n}){if(t.setLoading(!1),n.image_b64!=null&&t.setImage(`data:image/png;base64,${n.image_b64}`),n.sample_id!=null&&t.setSampleId(n.sample_id),n.wavelengths!=null&&n.intensities==null){t.setWavelengths(n.wavelengths);const o=s=>n.wavelengths.reduce((R,c,g)=>Math.abs(c-s)<Math.abs(n.wavelengths[R]-s)?g:R,0);t.setRgbBands({r:o(660),g:o(550),b:o(460)})}n.wavelengths!=null&&n.intensities!=null&&t.setSpectrum({wavelengths:n.wavelengths,intensities:n.intensities,pixel_x:n.pixel_x,pixel_y:n.pixel_y}),n.rgb_bands!=null&&t.setRgbBands(n.rgb_bands)}}C.registerOperator(Ve,"@ehofesmann/envi-spectral-viewer");function De(e){return React.createElement(L.SvgIcon,{...e},React.createElement("path",{d:"M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.18.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.18.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zM17 8.1c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.26-2.05-.6C9.2 8.53 8.38 8.1 7 8.1s-2.2.43-2.95.8C3.4 9.22 2.87 9.5 2 9.5v1.94c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8V9.5c-.9 0-1.4-.26-2.05-.6-.75-.38-1.6-.8-2.95-.8z"}))}h.registerComponent({name:"SpectralProfilePanel",label:"Spectral Profile",component:Pe,Icon:De,type:h.PluginComponentType.Panel,activator:({dataset:e})=>e!==null,panelOptions:{surfaces:"modal"}})});
//# sourceMappingURL=index.umd.js.map
