import React from "react";
import { extend } from "lodash";
import PropTypes from "prop-types";
import Tooltip from "antd/lib/tooltip";

function HelpTrigger({ title, href, className, children }) {
  return (
    <Tooltip
      title={
        <React.Fragment>
          {title}
          <i className="fa fa-external-link" style={{ marginLeft: 5 }} />
        </React.Fragment>
      }>
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </Tooltip>
  );
}

HelpTrigger.propTypes = {
  title: PropTypes.node,
  href: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
};

HelpTrigger.defaultValues = {
  title: null,
  className: null,
  children: null,
};

export const visualizationsSettings = {
  HelpTriggerComponent: HelpTrigger,
};

export function updateVisualizationsSettings(options) {
  extend(visualizationsSettings, options);
}
