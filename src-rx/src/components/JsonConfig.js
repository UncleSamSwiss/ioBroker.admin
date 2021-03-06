import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import LinearProgress from '@material-ui/core/LinearProgress';

import SaveCloseButtons from '@iobroker/adapter-react/Components/SaveCloseButtons';
import Router from '@iobroker/adapter-react/Components/Router';
import theme from '@iobroker/adapter-react/Theme';
import ConfirmDialog from '@iobroker/adapter-react/Dialogs/Confirm';
import I18n from '@iobroker/adapter-react/i18n';

import JsonConfigComponent from './JsonConfigComponent';
import ConfigCustomEasyAccess from './JsonConfigComponent/ConfigCustomEasyAccess';
import ConfigGeneric from "./JsonConfigComponent/ConfigGeneric";
import Tooltip from "@material-ui/core/Tooltip";
import Fab from "@material-ui/core/Fab";
import PublishIcon from "@material-ui/icons/Publish";
import Utils from './Utils';

const styles = {
    root: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
    },
    scroll: {
        height: 'calc(100% - 48px - 48px)',
        overflowY: 'auto'
    },
    exportImportButtons: {
        position: 'absolute',
        top: 5,
        right: 0,
        zIndex: 3,
    },
    button: {
        marginRight: 5
    }
};

class JsonConfig extends Router {
    constructor(props) {
        super(props);

        this.state = {
            schema: null,
            data: null,
            updateData: 0,
            common: null,
            changed: false,
            confirmDialog: false,
            theme: theme(props.themeName), // buttons requires special theme
        };

        this.getInstanceObject()
            .then(obj => this.getConfigFile()
                .then(schema =>
                    // load language
                    JsonConfigComponent.loadI18n(this.props.socket, schema?.i18n, this.props.adapterName)
                        .then(() =>
                            this.setState({schema, data: obj.native, common: obj.common}))));
    }

    /**
     * @private
     * @param {object} evt
     */
    handleFileSelect = evt => {
        let f = evt.target.files[0];
        if (f) {
            let r = new FileReader();
            r.onload = async e => {
                let contents = e.target.result;
                try {
                    let json = JSON.parse(contents);
                    this.setState({data: json});
                } catch (err) {
                    window.alert(I18n.t('Failed to parse JSON file'));
                }
            };
            r.readAsText(f);
        } else {
            window.alert(I18n.t('Failed to open JSON File'));
        }
    }

    getExportImportButtons() {
        return <div className={this.props.classes.exportImportButtons}>
            <Tooltip title={this.props.t('Import settings from JSON file')}>
                <Fab size="small" classes={{root: this.props.classes.button}} onClick={() => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('id', 'files');
                    input.setAttribute('opacity', 0);
                    input.addEventListener('change', e => this.handleFileSelect(e), false);
                    input.click();
                }}>
                    <PublishIcon />
                </Fab>
            </Tooltip>
            <Tooltip title={this.props.t('Export setting to JSON file')}>
                <Fab size="small" classes={{root: this.props.classes.button}} onClick={() => {
                    Utils.generateFile(this.props.adapterName + '.' + this.props.instance + '.json', this.state.data);
                }}>
                    <PublishIcon style={{ transform: 'rotate(180deg)' }} />
                </Fab>
            </Tooltip>
        </div>;
    }

    getConfigFile() {
        return this.props.socket.readFile(this.props.adapterName + '.admin', 'jsonConfig.json')
            .then(data => {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    window.alert('Cannot parse json config!');
                }
            })
            .catch(e => window.alert('Cannot read file: ' + e));
    }

    getInstanceObject() {
        return this.props.socket.getObject(`system.adapter.${this.props.adapterName}.${this.props.instance}`)
            .catch(e => window.alert('Cannot read instance object: ' + e));
    }

    renderConfirmDialog() {
        if (!this.state.confirmDialog) {
            return null;
        }
        return <ConfirmDialog
            title={ I18n.t('Please confirm') }
            text={ I18n.t('Some data are not stored. Discard?') }
            ok={ I18n.t('Discard') }
            cancel={ I18n.t('Cancel') }
            onClose={isYes =>
                this.setState({ confirmDialog: false}, () => isYes && Router.doNavigate(null))}
        />;
    }

    async onSave(doSave, close) {
        if (doSave) {
            const obj = await this.getInstanceObject();

            for (const a in this.state.data) {
                if (this.state.data.hasOwnProperty(a)) {
                    ConfigGeneric.setValue(obj.native, a, this.state.data[a]);
                }
            }

            try {
                await this.props.socket.setObject(obj._id, obj);
            } catch (e) {
                window.alert('Cannot set object: ' + e);
            }

            this.setState({changed: false, data: obj.native, updateData: this.state.updateData + 1}, () =>
                close && Router.doNavigate(null));
        } else {
            if (this.state.changed) {
                return this.setState({confirmDialog: true});
            } else {
                Router.doNavigate(null);
            }
        }
    }

    render() {
        const { classes } = this.props;
        if (!this.state.data || !this.state.schema) {
            return <LinearProgress />;
        }

        return <div className={this.props.classes.root}>
            {this.renderConfirmDialog()}
            {this.getExportImportButtons()}
            <JsonConfigComponent
                className={ classes.scroll }
                socket={this.props.socket}
                theme={this.props.theme}
                themeName={this.props.themeName}
                themeType={this.props.themeType}
                adapterName={this.props.adapterName}
                instance={this.props.instance}
                isFloatComma={this.props.isFloatComma}
                dateFormat={this.props.dateFormat}

                schema={this.state.schema}
                common={this.state.common}
                data={this.state.data}
                updateData={this.state.updateData}
                onError={error => this.setState({ error })}
                onChange={(data, changed) => this.setState({ data, changed })}

                customs={{
                    configCustomEasyAccess: ConfigCustomEasyAccess
                }}
            />
            <SaveCloseButtons
                isIFrame={false}
                dense={true}
                paddingLeft={0}
                theme={this.state.theme}
                noTextOnButtons={this.props.width === 'xs' || this.props.width === 'sm' || this.props.width === 'md'}
                changed={this.state.error || this.state.changed}
                error={this.state.error}
                onSave={async close => await this.onSave(true, close)}
                onClose={async () => await this.onSave(false)}
            />
        </div>;
    }
}

JsonConfig.propTypes = {
    menuPadding: PropTypes.number,
    adapterName: PropTypes.string,
    instance: PropTypes.number,
    isFloatComma: PropTypes.bool,
    dateFormat: PropTypes.string,

    socket: PropTypes.object,

    theme: PropTypes.object,
    themeName: PropTypes.string,
    themeType: PropTypes.string,
};

export default withStyles(styles)(JsonConfig);