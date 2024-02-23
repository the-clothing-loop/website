import { Bag } from "../../api";

export default function BagSVG({
  bag,
  isList,
}: {
  bag: Bag;
  isList?: boolean;
}) {
  let fontSize = (bag.number.length > 10 ? 10 : bag.number.length) * -1 + 40;
  let fontSizeWrapped = 28;
  if (bag.number.length < 13)
    fontSizeWrapped += Math.pow((bag.number.length - 13) * -1 * 0.8, 1.5);
  let padding = 10;

  return (
    <svg
      id="Laag_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="32.3 21.34 235.2 238.09"
      xmlSpace="preserve"
    >
      <style type="text/css">
        {
          // "\n\t.st0{fill:none;}\n\t.st1{fill:#FFFFFF;}\n\t.st2{fill:{bag.color};}\n\t.st3{font-family:'PlayfairDisplay-Bold';}\n\t.st4{font-size:115.218px;}\n"
        }
      </style>
      <g>
        <g>
          {isList ? null : (
            <rect
              fill={bag.color}
              x="32.3"
              y="21.34"
              width="235.2"
              height="238.09"
            ></rect>
          )}
          <path
            className="st0"
            fill="none"
            d="M200.7,79.9c-9.6-7.1-20.4-11.2-32.2-12.6c11.4,5.2,21.1,12.6,28.7,22.5c6.5,8.4,11,17.8,13.4,28.1h16 C222.6,102.5,214,89.7,200.7,79.9z"
          />
          <path
            className="st0"
            fill="none"
            d="M150.7,67.7c-1.5-0.3-3.2,0.2-4.8,0.5c-13.8,3-25.6,9.5-35.4,19.7c-8.3,8.6-13.9,18.7-16.8,30h111.5 c-3-11.7-8.7-21.9-17.1-30.5C177.7,76.8,165.2,70.2,150.7,67.7z"
          />
          <path
            className="st0"
            fill="none"
            d="M130.8,67.3c-9.8,1.3-18.8,4.4-27.1,9.6C95.3,82,88.4,88.6,83,96.7c-4.4,6.6-7.6,13.6-9.5,21.2h14.8 C94.1,94.6,108.4,77.9,130.8,67.3z"
          />
          <path
            className="st1"
            fill={isList ? bag.color : "#fff"}
            d="M232.2,117.9c-3.2-13.4-9.8-25.1-19.7-35c-8.4-8.4-18.4-14.4-29.8-18.1c-9.4-3-19-4-28.8-3.2 c-1.7,0.1-3.5,0.5-5.1,0.3c-7.1-0.8-14.3-0.8-21.4,0.4c-15.3,2.5-28.4,9.3-39.5,20.1c-10.1,9.9-16.8,21.8-20.1,35.5h-5.5v119.7 h175.2V117.9H232.2z M73.4,117.9c1.9-7.6,5.1-14.6,9.5-21.2c5.5-8.1,12.4-14.7,20.7-19.9c8.3-5.1,17.3-8.3,27.1-9.6 c-22.4,10.6-36.7,27.3-42.6,50.7H73.4z M93.7,117.9c2.9-11.4,8.5-21.4,16.8-30c9.8-10.2,21.6-16.7,35.4-19.7 c1.6-0.3,3.2-0.8,4.8-0.5c14.6,2.5,27,9.1,37.4,19.7c8.4,8.6,14.1,18.8,17.1,30.5H93.7z M210.7,117.9 c-2.4-10.3-6.9-19.6-13.4-28.1c-7.7-9.9-17.3-17.4-28.7-22.5c11.9,1.4,22.6,5.5,32.2,12.6c13.3,9.8,21.9,22.5,25.9,38H210.7z"
          />
        </g>
        {isList ? null : (
          <switch>
            <foreignObject
              width={178 - padding * 2}
              height="121"
              x={62 + padding}
              y="118"
              requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
            >
              <p
                text-anchor="middle"
                style={{
                  color: bag.color,
                  fontFamily: "'PlayfairDisplay-Bold'",
                  fontWeight: "bold",
                  fontSize: fontSizeWrapped + "px",
                  margin: "0",
                  display: "grid",
                  height: "100%",
                  textAlign: "center",
                  alignItems: "center",
                }}
              >
                {bag.number}
              </p>
            </foreignObject>
            <text
              transform="matrix(0.887 0 0 1 97.4705 180.6156)"
              text-anchor="middle"
              alignmentBaseline="middle"
              x="57.30"
              y="3%"
              fill={bag.color}
              fontFamily="'PlayfairDisplay-Bold'"
              fontWeight="bold"
              fontSize={fontSize + "px"}
            >
              {bag.number}
            </text>
          </switch>
        )}
      </g>
    </svg>
  );
}
