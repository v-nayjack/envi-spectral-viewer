(function(p,w){typeof exports=="object"&&typeof module<"u"?w(require("@fiftyone/plugins"),require("@mui/material"),require("@fiftyone/components"),require("@fiftyone/operators"),require("@fiftyone/state"),require("react"),require("recoil"),require("styled-components")):typeof define=="function"&&define.amd?define(["@fiftyone/plugins","@mui/material","@fiftyone/components","@fiftyone/operators","@fiftyone/state","react","recoil","styled-components"],w):(p=typeof globalThis<"u"?globalThis:p||self,w(p.__fop__,p.__mui__,p.__foc__,p.__foo__,p.__fos__,p.React,p.recoil,p.__styled__))})(this,function(p,w,Y,_,J,I,o,c){"use strict";function K(e){const a=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(e){for(const t in e)if(t!=="default"){const n=Object.getOwnPropertyDescriptor(e,t);Object.defineProperty(a,t,n.get?n:{enumerable:!0,get:()=>e[t]})}}return a.default=e,Object.freeze(a)}const L=K(J),G=o.atom({key:"hsiVisualizerImage_v1",default:null}),H=o.atom({key:"hsiVisualizerSampleId_v1",default:null}),O=o.atom({key:"hsiVisualizerSpectrum_v1",default:null}),M=o.atom({key:"hsiVisualizerLoading_v1",default:!1}),z=o.atom({key:"hsiVisualizerWavelengths_v1",default:[]}),A=o.atom({key:"hsiVisualizerRgbBands_v1",default:{r:27,g:16,b:6}}),P=o.atom({key:"hsiVisualizerChannelMode_v1",default:"rgb"}),j=o.atom({key:"hsiVisualizerGrayBand_v1",default:16});function Q(e){let a=0,t=0,n=0,m=1;if(e>=380&&e<440)a=-(e-440)/60,t=0,n=1,m=.3+.7*(e-380)/60;else if(e<490)a=0,t=(e-440)/50,n=1;else if(e<510)a=0,t=1,n=-(e-510)/20;else if(e<580)a=(e-510)/70,t=1,n=0;else if(e<645)a=1,t=-(e-645)/65,n=0;else if(e<=780)a=1,t=0,n=0,m=e>700?.3+.7*(780-e)/80:1;else{const d=Math.min((e-780)/1700,1),u=Math.round(220-150*d),r=Math.round(100-70*d),l=Math.round(120+60*d);return`rgb(${u},${r},${l})`}return`rgb(${Math.round(255*a*m)},${Math.round(255*t*m)},${Math.round(255*n*m)})`}function U(e,a){return[380,420,440,460,490,510,540,580,610,645,700,780,900,1200,1600,2480].filter(n=>n>=e&&n<=a).map(n=>({offset:`${((n-e)/(a-e)*100).toFixed(1)}%`,color:Q(n)}))}const Z=c.div`
  padding: 0.75em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
`,ee=c.div`
  display: flex;
  flex-direction: row;
  gap: 0.75em;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`,te=c.div`
  flex: 0 0 45%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
`,ne=c.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
`,ae=c.div`
  position: relative;
  width: 100%;
  height: 100%;
`,ie=c.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  display: block;
  cursor: crosshair;
  border-radius: 4px;
  border: 1px solid #333;
`,oe=c.div`
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
`,le=c.div`
  background: #111;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  padding: 10px;
  flex: 1;
`,re=c.div`
  color: #555;
  font-size: 12px;
  font-style: italic;
`,ce=c.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 6px 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
`,se=c.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
`,N=c.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
`,T=c.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({color:e})=>e};
  flex-shrink: 0;
`,q=c.input`
  flex: 1;
  min-width: 40px;
  accent-color: ${({$color:e})=>e};
  cursor: pointer;
`,D=c.span`
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 64px;
`,de=c.span`
  font-size: 10px;
  color: #555;
  white-space: nowrap;
  flex-shrink: 0;
`;c.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;const ue=c.div`
  display: flex;
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
`,F=c.button`
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  background: ${({$active:e})=>e?"#3f3f46":"#1a1a1a"};
  color: ${({$active:e})=>e?"#fff":"#666"};
  &:hover { background: #3f3f46; color: #fff; }
`,fe=c.button`
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
`;function me({wavelengths:e,intensities:a,bandLines:t=[],loading:n=!1}){const u={top:10,right:10,bottom:28,left:44},r=460-u.left-u.right,l=140-u.top-u.bottom,g=!a||a.length===0,h=e[0],y=e[e.length-1],v=g?0:Math.min(...a),s=(g?1:Math.max(...a))-v||1,x=i=>(i-h)/(y-h)*r,C=i=>l-(i-v)/s*l,S=U(h,y),R="spectrumGrad",b=[0,.25,.5,.75,1].map(i=>({wl:Math.round(h+i*(y-h)),x:i*r})),$=g?[0,.5,1].map(i=>({val:"—",y:l-i*l})):[0,.5,1].map(i=>({val:(v+i*s).toFixed(1),y:l-i*l}));return React.createElement("svg",{viewBox:"0 0 460 140",style:{width:"100%",height:"auto",display:"block"}},React.createElement("defs",null,React.createElement("linearGradient",{id:R,x1:"0%",y1:"0%",x2:"100%",y2:"0%"},S.map((i,f)=>React.createElement("stop",{key:f,offset:i.offset,stopColor:i.color})))),React.createElement("g",{transform:`translate(${u.left},${u.top})`},$.map((i,f)=>React.createElement("line",{key:f,x1:0,y1:i.y,x2:r,y2:i.y,stroke:"#1e1e1e",strokeWidth:1})),t.map((i,f)=>{const B=e[i.bandIdx];if(B==null)return null;const k=x(B);return React.createElement("g",{key:f},React.createElement("line",{x1:k,y1:0,x2:k,y2:l,stroke:i.color,strokeWidth:1.5,strokeDasharray:"4,3",opacity:.8}),React.createElement("text",{x:k+3,y:8,fill:i.color,fontSize:8,opacity:.9},i.label))}),g&&React.createElement(React.Fragment,null,React.createElement("rect",{x:0,y:l/2-1,width:r,height:2,fill:`url(#${R})`,opacity:n?.5:.25},n&&React.createElement("animate",{attributeName:"opacity",values:"0.5;0.15;0.5",dur:"1.4s",repeatCount:"indefinite"})),n?React.createElement("text",{x:r/2,y:l/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#ff6d04",fontSize:10},"Loading spectrum…",React.createElement("animate",{attributeName:"opacity",values:"1;0.3;1",dur:"1.4s",repeatCount:"indefinite"})):React.createElement(React.Fragment,null,React.createElement("text",{x:r/2,y:l/2-10,textAnchor:"middle",dominantBaseline:"middle",fill:"#555",fontSize:10},"Click a pixel on the image"),React.createElement("text",{x:r/2,y:l/2+8,textAnchor:"middle",dominantBaseline:"middle",fill:"#3a3a3a",fontSize:9},"to plot its spectral signature here"))),!g&&React.createElement("polyline",{points:a.map((i,f)=>`${x(e[f])},${C(i)}`).join(" "),fill:"none",stroke:`url(#${R})`,strokeWidth:2,strokeLinejoin:"round",opacity:n?.25:1}),!g&&n&&React.createElement("text",{x:r/2,y:l/2,textAnchor:"middle",dominantBaseline:"middle",fill:"#ff6d04",fontSize:10},"Loading spectrum…",React.createElement("animate",{attributeName:"opacity",values:"1;0.3;1",dur:"1.4s",repeatCount:"indefinite"})),React.createElement("line",{x1:0,y1:l,x2:r,y2:l,stroke:"#444",strokeWidth:1}),b.map((i,f)=>React.createElement("g",{key:f,transform:`translate(${i.x},${l})`},React.createElement("line",{y2:4,stroke:"#444",strokeWidth:1}),React.createElement("text",{y:14,textAnchor:"middle",fill:"#666",fontSize:9},i.wl))),React.createElement("text",{x:r/2,y:l+26,textAnchor:"middle",fill:"#444",fontSize:9},"Wavelength (nm)"),React.createElement("line",{x1:0,y1:0,x2:0,y2:l,stroke:"#444",strokeWidth:1}),React.createElement("text",{transform:`translate(${-u.left+10},${l/2}) rotate(-90)`,textAnchor:"middle",fill:"#444",fontSize:9},"Intensity"),$.map((i,f)=>React.createElement("g",{key:f,transform:`translate(0,${i.y})`},React.createElement("line",{x1:-4,stroke:"#444",strokeWidth:1}),React.createElement("text",{x:-6,textAnchor:"end",dominantBaseline:"middle",fill:"#444",fontSize:8},i.val)))))}const pe=[{key:"r",color:"#f87171",label:"R"},{key:"g",color:"#4ade80",label:"G"},{key:"b",color:"#60a5fa",label:"B"}];function ge({sampleId:e,spectrum:a}){const t=o.useRecoilValue(z),[n,m]=o.useRecoilState(A),[d,u]=o.useRecoilState(j),[r,l]=o.useRecoilState(P),[g,h]=o.useRecoilState(M),y=t.length>0?t.length-1:199,v=s=>{var x;return t.length>0?`${(x=t[s])==null?void 0:x.toFixed(0)}nm`:`#${s}`},E=I.useCallback(()=>{e&&(h(!0),r==="rgb"?_.executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image",{sample_id:e,r_band:n.r,g_band:n.g,b_band:n.b}):_.executeOperator("@ehofesmann/envi-spectral-viewer/render_rgb_image",{sample_id:e,r_band:d,g_band:d,b_band:d}))},[e,r,n,d]);return React.createElement(ce,null,React.createElement(ue,null,React.createElement(F,{$active:r==="rgb",onClick:()=>l("rgb")},"RGB"),React.createElement(F,{$active:r==="gray",onClick:()=>l("gray")},"Gray")),React.createElement(se,null,r==="rgb"?pe.map(({key:s,color:x,label:C})=>React.createElement(N,{key:s},React.createElement(T,{color:x}),React.createElement(D,{style:{color:x}},C,": ",v(n[s])),React.createElement(q,{type:"range",$color:x,min:0,max:y,value:n[s],onChange:S=>m(R=>({...R,[s]:Number(S.target.value)}))}))):React.createElement(N,null,React.createElement(T,{color:"#aaa"}),React.createElement(D,{style:{color:"#aaa"}},"Band: ",v(d)),React.createElement(q,{type:"range",$color:"#aaa",min:0,max:y,value:d,onChange:s=>u(Number(s.target.value))}))),e&&React.createElement(fe,{onClick:E,disabled:g},g?React.createElement(Y.LoadingSpinner,{size:"small",color:"base"}):"Render"),a&&React.createElement(de,null,"(",a.pixel_x,", ",a.pixel_y,")"))}function he(){const e=o.useRecoilValue(L.dataset),[a,t]=o.useRecoilState(G),[n]=o.useRecoilState(H),[m,d]=o.useRecoilState(M),u=o.useRecoilValue(z),[,r]=o.useRecoilState(z),[l,g]=o.useRecoilState(O),h=o.useRecoilValue(A),y=o.useRecoilValue(j),v=o.useRecoilValue(P),E=o.useRecoilValue(L.currentSampleId),s=I.useRef(null);I.useEffect(()=>{!e||!E||E!==n&&(t(null),g(null),r([]),s.current=null,d(!0),_.executeOperator("@ehofesmann/envi-spectral-viewer/load_hsi_image",{sample_id:E}))},[E,e]);const x=I.useCallback(S=>{if(!n)return;const R=S.target,b=R.getBoundingClientRect(),$=S.clientX-b.left,i=S.clientY-b.top,f=R.naturalWidth/R.naturalHeight,B=b.width/b.height,k=f>B?b.width:b.height*f,X=f>B?b.width/f:b.height,be=(b.width-k)/2,W=$-be,V=i;if(W<0||W>k||V>X)return;const ye=Math.round(W/k*R.naturalWidth),ve=Math.round(V/X*R.naturalHeight);s.current={x:$,y:V},d(!0),_.executeOperator("@ehofesmann/envi-spectral-viewer/get_spectral_profile",{sample_id:n,pixel_x:ye,pixel_y:ve})},[n]),C=l?v==="rgb"?[{bandIdx:h.r,color:"#f87171",label:"R"},{bandIdx:h.g,color:"#4ade80",label:"G"},{bandIdx:h.b,color:"#60a5fa",label:"B"}]:[{bandIdx:y,color:"#aaa",label:"Gray"}]:[];return React.createElement(Z,null,React.createElement(ee,null,React.createElement(te,null,m&&!a&&React.createElement(re,null,"Loading…"),a&&React.createElement(ae,null,React.createElement(ie,{src:a,alt:"HSI pseudo-RGB",onClick:x,title:"Click a pixel to see its spectral profile"}),s.current&&l&&React.createElement(oe,{x:s.current.x,y:s.current.y}))),React.createElement(ne,null,u.length>0&&React.createElement(le,null,React.createElement(me,{wavelengths:u,intensities:l==null?void 0:l.intensities,bandLines:C,loading:m&&!!a})))),React.createElement(ge,{sampleId:n,spectrum:l}))}class xe extends _.Operator{get config(){return new _.OperatorConfig({name:"show_hsi_data",label:"Show HSI Data",unlisted:!0})}useHooks(){return{setImage:o.useSetRecoilState(G),setSampleId:o.useSetRecoilState(H),setSpectrum:o.useSetRecoilState(O),setLoading:o.useSetRecoilState(M),setWavelengths:o.useSetRecoilState(z),setRgbBands:o.useSetRecoilState(A)}}async execute({hooks:a,params:t}){if(a.setLoading(!1),t.image_b64!=null&&a.setImage(`data:image/png;base64,${t.image_b64}`),t.sample_id!=null&&a.setSampleId(t.sample_id),t.wavelengths!=null&&t.intensities==null){a.setWavelengths(t.wavelengths);const n=m=>t.wavelengths.reduce((d,u,r)=>Math.abs(u-m)<Math.abs(t.wavelengths[d]-m)?r:d,0);a.setRgbBands({r:n(660),g:n(550),b:n(460)})}t.wavelengths!=null&&t.intensities!=null&&a.setSpectrum({wavelengths:t.wavelengths,intensities:t.intensities,pixel_x:t.pixel_x,pixel_y:t.pixel_y}),t.rgb_bands!=null&&a.setRgbBands(t.rgb_bands)}}_.registerOperator(xe,"@ehofesmann/envi-spectral-viewer");function Re(e){return React.createElement(w.SvgIcon,{...e},React.createElement("path",{d:"M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.18.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.18.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zM17 8.1c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.26-2.05-.6C9.2 8.53 8.38 8.1 7 8.1s-2.2.43-2.95.8C3.4 9.22 2.87 9.5 2 9.5v1.94c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8V9.5c-.9 0-1.4-.26-2.05-.6-.75-.38-1.6-.8-2.95-.8z"}))}p.registerComponent({name:"SpectralProfilePanel",label:"Spectral Profile",component:he,Icon:Re,type:p.PluginComponentType.Panel,activator:({dataset:e})=>e!==null,panelOptions:{surfaces:"modal"}})});
//# sourceMappingURL=index.umd.js.map
