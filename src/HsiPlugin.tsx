import { PluginComponentType, registerComponent } from "@fiftyone/plugins";
import { SvgIcon } from "@mui/material";
import { SpectralPanel } from "./SpectralPanel";
import "./operators"; // register TypeScript operators

// Waves icon path (from @mui/icons-material/Waves)
function SpectralIcon(props: any) {
  return (
    <SvgIcon {...props}>
      <path d="M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.18.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.18.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zM17 8.1c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.26-2.05-.6C9.2 8.53 8.38 8.1 7 8.1s-2.2.43-2.95.8C3.4 9.22 2.87 9.5 2 9.5v1.94c1.35 0 2.2-.43 2.95-.8.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.17-.6 2.05-.6s1.4.26 2.05.6c.75.38 1.57.8 2.95.8V9.5c-.9 0-1.4-.26-2.05-.6-.75-.38-1.6-.8-2.95-.8z" />
    </SvgIcon>
  );
}

registerComponent({
  name: "SpectralProfilePanel",
  label: "Spectral Profile",
  component: SpectralPanel,
  Icon: SpectralIcon,
  type: PluginComponentType.Panel,
  activator: ({ dataset }) => dataset !== null,
  panelOptions: {
    surfaces: "modal",
  },
});
