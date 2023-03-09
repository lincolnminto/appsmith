import React from "react";
import { NavigationSetting } from "constants/AppConstants";
import StyledPropertyHelpLabel from "./StyledPropertyHelpLabel";
import SwitchWrapper from "../../Components/SwitchWrapper";
import { Switch } from "design-system-old";
import { UpdateSetting } from ".";
import _ from "lodash";

const SwitchSetting = (props: {
  label: string;
  keyName: keyof NavigationSetting;
  value: boolean;
  updateSetting: UpdateSetting;
  tooltip?: string;
}) => {
  const { keyName, label, tooltip, updateSetting, value } = props;

  return (
    <div className="pt-4">
      <div className="flex justify-between content-center">
        <StyledPropertyHelpLabel
          label={label}
          lineHeight="1.17"
          maxWidth="270px"
          tooltip={tooltip}
        />

        <SwitchWrapper>
          <Switch
            checked={value}
            className="mb-0"
            id={`t--navigation-settings-${_.kebabCase(keyName)}`}
            large
            onChange={() => {
              updateSetting(keyName, !value);
            }}
          />
        </SwitchWrapper>
      </div>
    </div>
  );
};

export default SwitchSetting;
