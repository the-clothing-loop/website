import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";
import isSSR from "../../util/is_ssr";
interface Props {
  data: string;
}
export default function QrCode(props: Props) {
  const [qrCode] = useState(
    new QRCodeStyling({
      width: 300,
      height: 300,
      dotsOptions: {
        color: "#000",
        type: "classy",
      },
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "M",
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#000",
        gradient: {
          type: "linear",
          rotation: 1,
          colorStops: [
            { offset: 0, color: "#e57b16" },
            { offset: 0.5, color: "#3e936d" },
            { offset: 1, color: "#9a5fff" },
          ],
        },
      },
      cornersDotOptions: { type: "square", color: "#000", gradient: undefined },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 20,
      },
    }),
  );
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isSSR()) return;
    qrCode.update({ data: props.data });
    qrCode.append(ref.current!);
  }, [props.data]);

  return <div ref={ref} />;
}
