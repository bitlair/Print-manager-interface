import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomComponent, { BaseProps } from "./CustomComponent";
import { faSpinner } from "@fortawesome/pro-solid-svg-icons";

interface AcitivytIndicatorProps extends BaseProps {
    className?: string;
}

export default class ActivityIndicator extends CustomComponent<AcitivytIndicatorProps, {}>
{
    render()
    {
        return (
            <FontAwesomeIcon
                icon={faSpinner}
                spin
                {...this.props}
            />
        );
    }
}