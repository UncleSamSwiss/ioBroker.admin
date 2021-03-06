import {useState, useEffect} from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import TextFieldsIcon from '@material-ui/icons/TextFields';
import DescriptionIcon from '@material-ui/icons/Description';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PageviewIcon from '@material-ui/icons/Pageview';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import ColorLensIcon from '@material-ui/icons/ColorLens';
import ImageIcon from '@material-ui/icons/Image';

import {IOTextField, IOColorPicker, IOFileInput} from '../IOFields/Fields';
import Utils from '../Utils';

function EnumEditDialog(props) {
    let [originalId, setOriginalId] = useState(null);
    useEffect(()=>{
        setOriginalId(props.enum._id);
    }, [props.open]);

    if (!props.open) {
        return null;
    }

    let idExists = props.enums.find(enumItem => enumItem._id == props.enum._id);
    let idChanged = props.enum._id !== originalId;

    let canSave = props.enum._id !== 'system.enum.'

    if (props.isNew) {
        if (idExists) {
            canSave = false;
        }
    } else {
        if (idExists && idChanged) {
            canSave = false;
        }
    }

    const getShortId = _id => {
        return _id.split('.').pop();
    };

    const name2Id = name =>
        name.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_').toLowerCase();

    const changeShortId = (_id, short) => {
        let idArray = _id.split('.');
        idArray[idArray.length-1] = short;
        return idArray.join('.');
    }

    return <Dialog PaperProps={{className: props.classes.dialogPaper}} open={props.open} onClose={props.onClose}>
        <DialogTitle className={props.classes.dialogTitle} style={{padding:12}} >
           { props.t( "Enum parameters" ) }
        </DialogTitle>
        <DialogContent >
            <Grid  container spacing={4} className={props.classes.dialog}>
                <Grid item xs={12} md={6}>
                    <IOTextField 
                        label="Name" 
                        t={props.t} 
                        value={ props.enum.common.name }
                        onChange={e=>{
                            let newData = props.enum;
                            if (name2Id(newData.common.name) === getShortId(newData._id)) {
                                newData._id = changeShortId(newData._id, name2Id(e.target.value));
                            }
                            newData.common.name = e.target.value;
                            props.change(newData);
                        }}
                        autoComplete="off"
                        icon={TextFieldsIcon}
                        classes={props.classes}
                    />
                </Grid>
                 <Grid item xs={12} md={6}>
                    <IOTextField 
                        label="ID edit" 
                        t={props.t} 
                        disabled={props.enum.common.dontDelete}
                        value={ props.enum._id.split('.')[props.enum._id.split('.').length-1] }
                        onChange={e=>{
                            let newData = props.enum;
                            newData._id = changeShortId(newData._id, name2Id(e.target.value));
                            props.change(newData);
                        }}
                        icon={LocalOfferIcon}
                        classes={props.classes}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <IOTextField 
                        label="ID preview" 
                        t={props.t} 
                        disabled
                        value={ props.enum._id }
                        icon={PageviewIcon}
                        classes={props.classes}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <IOTextField 
                        label="Description" 
                        t={props.t} 
                        value={ props.enum.common.desc }
                        onChange={e=>{
                            let newData = props.enum;
                            newData.common.desc = e.target.value;
                            props.change(newData);
                        }}
                        icon={DescriptionIcon}
                        classes={props.classes}
                    />
                </Grid>
                 <Grid item xs={12} md={6}>
                    <IOFileInput 
                        label="Icon" 
                        t={props.t} 
                        value={ props.enum.common.icon }
                        onChange={fileblob=>{
                            let newData = props.enum;
                            newData.common.icon = fileblob;
                            props.change(newData);
                        }}
                        previewClassName={props.classes.iconPreview}
                        icon={ImageIcon}
                        classes={props.classes}
                    />                
                </Grid>
                <Grid item xs={12} md={6}>
                    <IOColorPicker 
                        label="Color" 
                        t={props.t} 
                        value={ props.enum.common.color }
                        previewClassName={props.classes.iconPreview}
                        onChange={color=>{
                            let newData = props.enum;
                            newData.common.color = color;
                            props.change(newData);
                        }}
                        icon={ColorLensIcon}
                        className={props.classes.colorPicker}
                        classes={props.classes}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions className={props.classes.dialogActions} >
            <Button onClick={()=>props.saveData(props.isNew ? null : originalId)} disabled={!canSave}>Save</Button>
            <Button onClick={props.onClose}>Cancel</Button>
        </DialogActions> 
    </Dialog>;
}

export default EnumEditDialog;