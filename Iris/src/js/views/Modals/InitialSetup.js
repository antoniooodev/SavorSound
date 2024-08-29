import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Modal from "./Modal";
import "./InitialSetup.scss";
import * as coreActions from "../../services/core/actions";
import * as uiActions from "../../services/ui/actions";
import * as pusherActions from "../../services/pusher/actions";
import * as mopidyActions from "../../services/mopidy/actions";
import { CSSTransition } from "react-transition-group";
import { motion } from "framer-motion";
import { queryString, isHosted } from "../../util/helpers";
import { I18n, i18n } from "../../locale";
import { withRouter } from "../../util";
import Button from "../../components/Button";

const SoundFoodLogo = () => {
  const [innovationText, setInnovationText] = useState("");

  useEffect(() => {
    const text = "innnovation";
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setInnovationText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  const handleVinylClick = (e) => {
    e.preventDefault();
    window.open("http://soundfood.it/", "_blank");
  };

  return (
    <div className="logo-container">
      <h1 className="titleinitial">
        S
        <span className="vinyl-o" onClick={handleVinylClick}>
          <span className="vinyl-inner">o</span>
        </span>
        undFood
      </h1>
      <p className="subtitle">
        we bring <span className="innovation">{innovationText}</span> to
        restaurateurs
      </p>
    </div>
  );
};

class InitialSetup extends React.Component {
  constructor(props) {
    super(props);

    const { host, port, username, allow_reporting } = props;

    const generatedUsername = username || generateUniqueUsername();

    this.state = {
      username: generateUniqueUsername(),
      allow_reporting,
      host,
      port,
    };
  }

  componentDidMount() {
    const {
      location: { search },
      uiActions,
    } = this.props;

    // Check for url-parsed configuration values
    const customHost = queryString("host", search);
    const customPort = queryString("port", search);
    if (customHost) this.setState({ host: customHost });
    if (customPort) this.setState({ port: customPort });

    uiActions.setWindowTitle(i18n("modal.initial_setup.title"));
  }

  handleSubmit(e) {
    e.preventDefault();
    const self = this;

    // Only if we've changed the username do we set it
    if (this.props.username !== this.state.username) {
      this.props.pusherActions.setUsername(this.state.username);
    }

    this.props.uiActions.set({
      initial_setup_complete: true,
      allow_reporting: this.state.allow_reporting,
    });

    this.props.mopidyActions.set({
      host: this.state.host,
      port: this.state.port,
    });

    this.setState({ saving: true });

    // Wait a jiffy to allow changes to apply to store
    setTimeout(() => {
      // We've changed a connection setting, so need to reload
      if (
        self.state.host !== self.props.host ||
        self.state.port !== self.props.port
      ) {
        window.location = "/";
      } else {
        self.props.navigate("/");
      }
    }, 200);

    return false;
  }

  render() {
    return (
      <Modal className="modal--initial-setup" noclose>
        <SoundFoodLogo />
        <form onSubmit={(e) => this.handleSubmit(e)}>
          <div className="field text">
            <div className="name">
              <I18n path="settings.server.username.label" />
            </div>
            <div className="input">
              <input
                type="text"
                onChange={(e) =>
                  this.setState({ username: e.target.value.replace(/\W/g, "") })
                }
                value={this.state.username}
              />
              <div className="description">
                <I18n path="settings.server.username.description" />
              </div>
            </div>
          </div>

          <div className="field">
            <div className="name">
              <I18n path="settings.servers.host" />
            </div>
            <div className="input">
              <input
                type="text"
                onChange={(e) => this.setState({ host: e.target.value })}
                value={this.state.host}
              />
            </div>
          </div>
          <div className="field">
            <div className="name">
              <I18n path="settings.servers.port" />
            </div>
            <div className="input">
              <input
                type="text"
                onChange={(e) => this.setState({ port: e.target.value })}
                value={this.state.port}
              />
            </div>
          </div>

          <div className="actions centered-text">
            <Button
              type="primary"
              size="large"
              working={this.state.saving}
              onClick={(e) => this.handleSubmit(e)}
              tracking={{ category: "InitialSetup", action: "Submit" }}
            >
              <I18n path="actions.save" />
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  allow_reporting: state.ui.allow_reporting,
  username:
    state.pusher && state.pusher.username ? state.pusher.username : null,
  host: state.mopidy.host,
  port: state.mopidy.port,
});

const mapDispatchToProps = (dispatch) => ({
  coreActions: bindActionCreators(coreActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
  pusherActions: bindActionCreators(pusherActions, dispatch),
  mopidyActions: bindActionCreators(mopidyActions, dispatch),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(InitialSetup)
);

export function generateUniqueUsername() {
  // Simulate localStorage using an object (replace with actual localStorage in a real application)
  let localStorageEmulator = {};
  if (typeof window !== "undefined") {
    localStorageEmulator = window.localStorage;
  }

  // Check if a device ID already exists in localStorage
  let deviceId = localStorageEmulator.getItem("deviceId");
  if (!deviceId) {
    // If no device ID exists, generate a new UUID
    deviceId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
    // Store the newly generated deviceId in localStorage
    localStorageEmulator.setItem("deviceId", deviceId);
  }

  // Check if a username is already associated with this device ID
  let username = localStorageEmulator.getItem(`username-${deviceId}`);
  if (!username) {
    // If no username exists for this device
    // Retrieve the last assigned username number from localStorage, or default to 0
    let lastAssignedUsername =
      localStorageEmulator.getItem("lastAssignedUsername") || 0;

    // Increment the last assigned username number
    let newUsernameNumber = parseInt(lastAssignedUsername) + 1;

    // Update the last assigned username number in localStorage
    localStorageEmulator.setItem("lastAssignedUsername", newUsernameNumber);

    // Generate the new username based on the incremented number
    username = newUsernameNumber.toString();

    // Store the association between the device ID and the generated username in localStorage
    localStorageEmulator.setItem(`username-${deviceId}`, username);
  }

  // Return the generated or retrieved username
  return username;
}
