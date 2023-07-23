import {OpenSourceLicense} from "../pages/OpenSource";

export default function LicenseItem(props: { licenseItem: OpenSourceLicense }) {
    return (
        <div>
            <p>{props.licenseItem.name}</p>
            <ul>
                {props.licenseItem.modules.map((module) => (
                    <li>{module}</li>
                ))}
            </ul>
        </div>
    );
}
