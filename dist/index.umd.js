(function(E,X){typeof exports=="object"&&typeof module<"u"?X(require("@fiftyone/plugins"),require("@mui/material"),require("@fiftyone/components"),require("@fiftyone/operators"),require("@fiftyone/state"),require("react"),require("recoil"),require("styled-components")):typeof define=="function"&&define.amd?define(["@fiftyone/plugins","@mui/material","@fiftyone/components","@fiftyone/operators","@fiftyone/state","react","recoil","styled-components"],X):(E=typeof globalThis<"u"?globalThis:E||self,X(E.__fop__,E.__mui__,E.__foc__,E.__foo__,E.__fos__,E.React,E.recoil,E.__styled__))})(this,function(E,X,he,D,be,u,i,s){"use strict";function Re(e){const a=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const n in e)if(n!=="default"){const t=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(a,n,t.get?t:{enumerable:!0,get:()=>e[n]})}}return a.default=e,Object.freeze(a)}const ae=Re(be),oe=i.atom({key:"hsiVisualizerImage_v1",default:null}),re=i.atom({key:"hsiVisualizerSampleId_v1",default:null}),ie=i.atom({key:"hsiVisualizerSpectrum_v1",default:null}),U=i.atom({key:"hsiVisualizerLoading_v1",default:!1}),N=i.atom({key:"hsiVisualizerWavelengths_v1",default:[]}),J=i.atom({key:"hsiVisualizerRgbBands_v1",default:{r:27,g:16,b:6}}),le=i.atom({key:"hsiVisualizerChannelMode_v1",default:"rgb"}),ce=i.atom({key:"hsiVisualizerGrayBand_v1",default:16});function ye(e){let a=0,n=0,t=0,d=1;if(e>=380&&e<440)a=-(e-440)/60,n=0,t=1,d=.3+.7*(e-380)/60;else if(e<490)a=0,n=(e-440)/50,t=1;else if(e<510)a=0,n=1,t=-(e-510)/20;else if(e<580)a=(e-510)/70,n=1,t=0;else if(e<645)a=1,n=-(e-645)/65,t=0;else if(e<=780)a=1,n=0,t=0,d=e>700?.3+.7*(780-e)/80:1;else{const R=Math.min((e-780)/1700,1),l=Math.round(220-150*R),g=Math.round(100-70*R),o=Math.round(120+60*R);return`rgb(${l},${g},${o})`}return`rgb(${Math.round(255*a*d)},${Math.round(255*n*d)},${Math.round(255*t*d)})`}function ve(e,a){return[380,420,440,460,490,510,540,580,610,645,700,780,900,1200,1600,2480].filter(t=>t>=e&&t<=a).map(t=>({offset:`${((t-e)/(a-e)*100).toFixed(1)}%`,color:ye(t)}))}const Ee=s.div`
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`,ke=s.div`
  display: flex;
  flex-direction: row;
  gap: 0.75em;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`,Se=s.div`
  flex: 0 0 45%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
`,_e=s.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
`,we=s.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: crosshair;
`,Ce=s.div`
  position: relative;
  width: 100%;
  height: 100%;
`,Me=s.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  display: block;
  cursor: crosshair;
  border-radius: 4px;
  border: 1px solid #333;
`,ze=s.div`
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
`,Be=s.div`
  background: #111;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  padding: 10px;
  flex: 1;
`,$e=s.div`
  color: #555;
  font-size: 12px;
  font-style: italic;
`,Ie=s.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 4px 10px;
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
`,T=s.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({$highlight:e})=>e?"#ff6d04":"#777"};
  font-variant-numeric: tabular-nums;
`,We=s.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 6px 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
`,Ae=s.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
`,se=s.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
`,ue=s.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({color:e})=>e};
  flex-shrink: 0;
`,de=s.input`
  flex: 1;
  min-width: 40px;
  accent-color: ${({$color:e})=>e};
  cursor: pointer;
`,q=s.span`
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 64px;
`,De=s.div`
  display: flex;
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
`,fe=s.button`
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  background: ${({$active:e})=>e?"#3f3f46":"#1a1a1a"};
  color: ${({$active:e})=>e?"#fff":"#666"};
  &:hover { background: #3f3f46; color: #fff; }
`,He=s.button`
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
`,Pe=s.button`
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
`,Le=s.input`
  width: 58px;
  height: 22px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 3px;
  color: #ccc;
  font-size: 11px;
  text-align: right;
  padding: 0 4px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  &:focus { outline: 1px solid #ff6d04; border-color: #ff6d04; }
  /* hide number input spinners */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  -moz-appearance: textfield;
`;function Ve({wavelengths:e,intensities:a,bandLines:n=[],loading:t=!1}){const l={top:10,right:10,bottom:28,left:44},g=460-l.left-l.right,o=140-l.top-l.bottom,b=!a||a.length===0,c=e[0],H=e[e.length-1],w=b?0:Math.min(...a),k=(b?1:Math.max(...a))-w||1,m=r=>(r-c)/(H-c)*g,v=r=>o-(r-w)/k*o,p=ve(c,H),y="spectrumGrad",x=[0,.25,.5,.75,1].map(r=>({wl:Math.round(c+r*(H-c)),x:r*g})),O=b?[0,.5,1].map(r=>({val:"—",y:o-r*o})):[0,.5,1].map(r=>{const h=w+r*k;return{val:h>100?h.toFixed(0):h.toFixed(1),y:o-r*o}});return React.createElement("svg",{viewBox:"0 0 460 140",preserveAspectRatio:"xMidYMid meet",style:{width:"100%",height:"100%"}},React.createElement("defs",null,React.createElement("linearGradient",{id:y,x1:"0",y1:"0",x2:"1",y2:"0"},p.map((r,h)=>React.createElement("stop",{key:h,offset:r.offset,stopColor:r.color})))),React.createElement("g",{transform:`translate(${l.left},${l.top})`},b&&!t&&React.createElement("text",{x:g/2,y:o/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#555",fontSize:11},"Click a pixel to view its spectrum"),b&&t&&React.createElement("text",{x:g/2,y:o/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#ff6d04",fontSize:11},"Loading spectrum…",React.createElement("animate",{attributeName:"opacity",values:"1;0.3;1",dur:"1.4s",repeatCount:"indefinite"})),n.map((r,h)=>{if(r.bandIdx<0||r.bandIdx>=e.length)return null;const L=m(e[r.bandIdx]);return React.createElement("g",{key:h},React.createElement("line",{x1:L,y1:0,x2:L,y2:o,stroke:r.color,strokeWidth:1,strokeDasharray:"4 3",opacity:.6}),React.createElement("text",{x:L,y:-2,textAnchor:"middle",fill:r.color,fontSize:8},r.label))}),!b&&React.createElement("polyline",{points:a.map((r,h)=>`${m(e[h])},${v(r)}`).join(" "),fill:"none",stroke:`url(#${y})`,strokeWidth:2,strokeLinejoin:"round",opacity:t?.25:1}),!b&&t&&React.createElement("text",{x:g/2,y:o/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#ff6d04",fontSize:10},"Loading spectrum…",React.createElement("animate",{attributeName:"opacity",values:"1;0.3;1",dur:"1.4s",repeatCount:"indefinite"})),React.createElement("line",{x1:0,y1:o,x2:g,y2:o,stroke:"#444",strokeWidth:1}),x.map((r,h)=>React.createElement("g",{key:h,transform:`translate(${r.x},${o})`},React.createElement("line",{y2:4,stroke:"#444",strokeWidth:1}),React.createElement("text",{y:14,textAnchor:"middle",fill:"#666",fontSize:9},r.wl))),React.createElement("text",{x:g/2,y:o+26,textAnchor:"middle",fill:"#444",fontSize:9},"Wavelength (nm)"),React.createElement("line",{x1:0,y1:0,x2:0,y2:o,stroke:"#444",strokeWidth:1}),React.createElement("text",{transform:`translate(${-l.left+10},${o/2}) rotate(-90)`,textAnchor:"middle",fill:"#444",fontSize:9},"Intensity"),O.map((r,h)=>React.createElement("g",{key:h,transform:`translate(0,${r.y})`},React.createElement("line",{x1:-4,stroke:"#444",strokeWidth:1}),React.createElement("text",{x:-6,textAnchor:"end",dominantBaseline:"middle",fill:"#444",fontSize:8},r.val)))))}const Oe=[{key:"r",color:"#f87171",label:"R"},{key:"g",color:"#4ade80",label:"G"},{key:"b",color:"#60a5fa",label:"B"}];function me({wavelengthNm:e,onCommit:a,min:n,max:t,borderColor:d}){const[R,l]=u.useState(!1),[g,o]=u.useState(""),b=()=>{l(!1);const c=Number(g);!isNaN(c)&&c>=n&&c<=t&&a(c)};return React.createElement(Le,{type:"text",inputMode:"numeric",value:R?g:`${Math.round(e)}`,style:d?{borderColor:d}:void 0,onFocus:c=>{l(!0),o(`${Math.round(e)}`),setTimeout(()=>c.target.select(),0)},onChange:c=>{o(c.target.value.replace(/[^0-9.-]/g,""))},onBlur:b,onKeyDown:c=>{c.key==="Enter"&&(b(),c.target.blur()),c.key==="Escape"&&l(!1)}})}function Ye({sampleId:e,spectrum:a,onClear:n}){const t=i.useRecoilValue(N),[d,R]=i.useRecoilState(J),[l,g]=i.useRecoilState(ce),[o,b]=i.useRecoilState(le),[c,H]=i.useRecoilState(U),w=t.length>0?t.length-1:199,P=u.useCallback(()=>{e&&(H(!0),o==="rgb"?D.executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image",{sample_id:e,r_band:d.r,g_band:d.g,b_band:d.b}):D.executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image",{sample_id:e,r_band:l,g_band:l,b_band:l}))},[e,o,d,l]),k=u.useCallback(m=>{if(t.length===0)return 0;let v=0,p=Math.abs(t[0]-m);for(let y=1;y<t.length;y++){const x=Math.abs(t[y]-m);x<p&&(v=y,p=x)}return v},[t]);return React.createElement(We,null,React.createElement(De,null,React.createElement(fe,{$active:o==="rgb",onClick:()=>b("rgb")},"RGB"),React.createElement(fe,{$active:o==="gray",onClick:()=>b("gray")},"Gray")),React.createElement(Ae,null,o==="rgb"?Oe.map(({key:m,color:v,label:p})=>React.createElement(se,{key:m},React.createElement(ue,{color:v}),React.createElement(q,{style:{color:v}},p,":"),React.createElement(me,{wavelengthNm:t[d[m]]??0,min:Math.round(t[0]??0),max:Math.round(t[w]??2500),borderColor:v,onCommit:y=>R(x=>({...x,[m]:k(y)}))}),React.createElement(q,{style:{color:v,minWidth:20}},"nm"),React.createElement(de,{type:"range",$color:v,min:0,max:w,value:d[m],onChange:y=>R(x=>({...x,[m]:Number(y.target.value)}))}))):React.createElement(se,null,React.createElement(ue,{color:"#aaa"}),React.createElement(q,{style:{color:"#aaa"}},"Band:"),React.createElement(me,{wavelengthNm:t[l]??0,min:Math.round(t[0]??0),max:Math.round(t[w]??2500),onCommit:m=>g(k(m))}),React.createElement(q,{style:{color:"#aaa",minWidth:20}},"nm"),React.createElement(de,{type:"range",$color:"#aaa",min:0,max:w,value:l,onChange:m=>g(Number(m.target.value))}))),e&&React.createElement(He,{onClick:P,disabled:c},c?React.createElement(he.LoadingSpinner,{size:"small",color:"base"}):"Render"),a&&React.createElement(Pe,{onClick:n},"Clear"))}function Ge(){const e=i.useRecoilValue(ae.dataset),[a,n]=i.useRecoilState(oe),[t]=i.useRecoilState(re),[d,R]=i.useRecoilState(U),l=i.useRecoilValue(N),[,g]=i.useRecoilState(N),[o,b]=i.useRecoilState(ie),c=i.useRecoilValue(J),H=i.useRecoilValue(ce),w=i.useRecoilValue(le),P=i.useRecoilValue(ae.currentSampleId),k=u.useRef(null),m=u.useRef(null),v=u.useRef(null),[p,y]=u.useState(1),[x,O]=u.useState({x:0,y:0}),r=u.useRef(!1),h=u.useRef({x:0,y:0}),L=u.useRef({x:0,y:0});u.useEffect(()=>{!e||!P||P!==t&&(n(null),b(null),g([]),k.current=null,y(1),O({x:0,y:0}),R(!0),D.executeOperator("@ehofesmann/envi-spectral-viewer/load_hsi_image",{sample_id:P}))},[P,e]);const Ne=u.useCallback(f=>{p<=1||(f.button===1||f.altKey)&&(f.preventDefault(),r.current=!0,h.current={x:f.clientX,y:f.clientY},L.current={...x})},[p,x]),Te=u.useCallback(f=>{if(!r.current)return;const _=f.clientX-h.current.x,S=f.clientY-h.current.y;O({x:L.current.x+_,y:L.current.y+S})},[]),pe=u.useCallback(()=>{r.current=!1},[]),qe=u.useCallback(()=>{y(1),O({x:0,y:0}),k.current=null},[]),Fe=u.useCallback(()=>{b(null),k.current=null},[]),Ze=u.useCallback(f=>{if(!t||r.current||f.altKey)return;const _=v.current,S=m.current;if(!_||!S)return;const z=S.getBoundingClientRect(),Y=f.clientX-z.left,B=f.clientY-z.top,C=(Y-x.x)/p,I=(B-x.y)/p,W=_.naturalWidth,M=_.naturalHeight,$=W/M,A=z.width,V=z.height,F=A/V,G=$>F?A:V*$,j=$>F?A/$:V,ee=(A-G)/2,Ue=0,Z=C-ee,K=I-Ue;if(Z<0||Z>G||K<0||K>j)return;const te=Math.round(Z/G*W),ne=Math.round(K/j*M);te<0||te>=W||ne<0||ne>=M||(k.current={fx:Z/G,fy:K/j},R(!0),D.executeOperator("@ehofesmann/envi-spectral-viewer/get_spectral_profile",{sample_id:t,pixel_x:te,pixel_y:ne}))},[t,p,x]),Ke=o?w==="rgb"?[{bandIdx:c.r,color:"#f87171",label:"R"},{bandIdx:c.g,color:"#4ade80",label:"G"},{bandIdx:c.b,color:"#60a5fa",label:"B"}]:[{bandIdx:H,color:"#aaa",label:"Gray"}]:[],Q=(()=>{if(!k.current||!o)return null;const f=v.current,_=m.current;if(!f||!_)return null;const S=_.getBoundingClientRect(),z=f.naturalWidth,Y=f.naturalHeight,B=z/Y,C=S.width,I=S.height,W=C/I,M=B>W?C:I*B,$=B>W?C/B:I,A=(C-M)/2,V=0,{fx:F,fy:G}=k.current,j=F*M+A,ee=G*$+V;return{x:j*p+x.x,y:ee*p+x.y}})(),xe=u.useRef(p),ge=u.useRef(x);return xe.current=p,ge.current=x,u.useEffect(()=>{const f=m.current;if(!f)return;const _=S=>{S.preventDefault();const z=f.getBoundingClientRect(),Y=S.clientX-z.left,B=S.clientY-z.top,C=xe.current,I=ge.current,W=S.deltaY>0?-.15:.15,M=Math.min(Math.max(C+W*C,1),15),$=M/C,A=Y-$*(Y-I.x),V=B-$*(B-I.y);y(M),O(M<=1?{x:0,y:0}:{x:A,y:V})};return f.addEventListener("wheel",_,{passive:!1}),()=>f.removeEventListener("wheel",_)},[a]),React.createElement(Ee,null,React.createElement(Ie,null,React.createElement(T,null,"🔍 Zoom: ",React.createElement("strong",null,p.toFixed(1),"×")),o?React.createElement(T,{$highlight:!0},"📍 Pixel: (",o.pixel_x,", ",o.pixel_y,")"):React.createElement(T,null,"📍 Pixel: —"),p>1&&React.createElement(T,{style:{marginLeft:"auto",color:"#555",fontSize:10}},"Alt+drag to pan · Double-click to reset")),React.createElement(ke,null,React.createElement(Se,null,d&&!a&&React.createElement($e,null,"Loading…"),a&&React.createElement(we,{ref:m,onMouseDown:Ne,onMouseMove:Te,onMouseUp:pe,onMouseLeave:pe,onDoubleClick:qe,title:p>1?"Scroll to zoom · Alt+drag to pan · Double-click to reset":"Scroll to zoom · Click a pixel for spectral profile"},React.createElement(Ce,{style:{transform:`translate(${x.x}px, ${x.y}px) scale(${p})`,transformOrigin:"0 0"}},React.createElement(Me,{ref:v,src:a,alt:"HSI pseudo-RGB",onClick:Ze,draggable:!1})),Q&&o&&React.createElement(ze,{x:Q.x,y:Q.y}))),React.createElement(_e,null,l.length>0&&React.createElement(Be,null,React.createElement(Ve,{wavelengths:l,intensities:o==null?void 0:o.intensities,bandLines:Ke,loading:d&&!!a})))),React.createElement(Ye,{sampleId:t,spectrum:o,onClear:Fe}))}class Xe extends D.Operator{get config(){return new D.OperatorConfig({name:"show_hsi_data",label:"Show HSI Data",unlisted:!0})}useHooks(){return{setImage:i.useSetRecoilState(oe),setSampleId:i.useSetRecoilState(re),setSpectrum:i.useSetRecoilState(ie),setLoading:i.useSetRecoilState(U),setWavelengths:i.useSetRecoilState(N),setRgbBands:i.useSetRecoilState(J)}}async execute({hooks:a,params:n}){if(a.setLoading(!1),n.image_b64!=null&&a.setImage(`data:image/png;base64,${n.image_b64}`),n.sample_id!=null&&a.setSampleId(n.sample_id),n.wavelengths!=null&&n.intensities==null){a.setWavelengths(n.wavelengths);const t=d=>n.wavelengths.reduce((R,l,g)=>Math.abs(l-d)<Math.abs(n.wavelengths[R]-d)?g:R,0);a.setRgbBands({r:t(660),g:t(550),b:t(460)})}n.wavelengths!=null&&n.intensities!=null&&a.setSpectrum({wavelengths:n.wavelengths,intensities:n.intensities,pixel_x:n.pixel_x,pixel_y:n.pixel_y}),n.rgb_bands!=null&&a.setRgbBands(n.rgb_bands)}}D.registerOperator(Xe,"@ehofesmann/envi-spectral-viewer");function je(e){return React.createElement(X.SvgIcon,{...e},React.createElement("path",{d:"M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.18.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.18.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zM17 8.1c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.26-2.05-.6C9.2 8.53 8.38 8.1 7 8.1s-2.2.43-2.95.8C3.4 9.22 2.87 9.5 2 9.5v1.94c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8V9.5c-.9 0-1.4-.26-2.05-.6-.75-.38-1.6-.8-2.95-.8z"}))}E.registerComponent({name:"SpectralProfilePanel",label:"Spectral Profile",component:Ge,Icon:je,type:E.PluginComponentType.Panel,activator:({dataset:e})=>e!==null,panelOptions:{surfaces:"modal"}})});
//# sourceMappingURL=index.umd.js.map
