import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { CardMedia, DialogTitle, makeStyles, ThemeProvider, Typography } from '@material-ui/core';

import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import CancelIcon from '@material-ui/icons/Cancel';

import I18n from '@iobroker/adapter-react/i18n';
import theme from '@iobroker/adapter-react/Theme';
import Utils from '@iobroker/adapter-react/Components/Utils';

let node = null;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        height: 'auto',
        display: 'flex',
        borderRadius: 4
    },
    paper: {
        maxWidth: 1000,
        width: '100%'
    },
    overflowHidden: {
        display: 'flex',
    },
    pre: {
        overflow: 'auto',
        margin: 20,
        '& p': {
            fontSize: 18,
        }
    },
    blockInfo: {
        right: 20,
        top: 10,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        color: 'silver'
    },
    img: {
        marginLeft: 10,
        width: 45,
        height: 45,
        margin: 'auto 0',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            zIndex: 2,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("img/no-image.png") 100% 100% no-repeat',
            backgroundSize: 'cover',
            backgroundColor: '#fff',
        }
    },
    img2: {
        width: 70,
        height: 70,
        margin: '10px 0',
        borderRadius: 4,
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            zIndex: 2,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("img/no-image.png") 100% 100% no-repeat',
            backgroundSize: 'cover',
            backgroundColor: '#fff',
        }
    },
    link:{
        margin: '10px 0',
    }
}));

const Status = ({ name, ...props }) => {
    switch (name) {
        case 'warning':
            return <WarningIcon style={{ color: '#ffca00' }} {...props} />;
        case 'info':
            return <InfoIcon style={{ color: '#007cff' }} {...props} />;
        case 'danger':
            return <CancelIcon style={{ color: '#ff2f2f' }} {...props} />;
        default:
            return <InfoIcon style={{ color: '#007cff' }} {...props} />;
    }
}

const NewsAdminDialog = ({ newsArr, current, callback, themeType, themeName }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [id, setId] = useState(current);
    const [last, setLast] = useState(false);
    const [indexArr, setIndexArr] = useState(0);

    useEffect(() => {
        const item = newsArr.find(el => el.id === id);
        if (item) {
            const index = newsArr.indexOf(item);
            if (index + 1 < newsArr.length) {
                const newId = newsArr[index + 1].id;
                if (newId) {
                    setId(newId);
                    setIndexArr(index + 1);
                }
            } else {
                setOpen(false);
                document.body.removeChild(node);
                node = null;
            }
        } else {
            setId(newsArr[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [last]);

    const onClose = () => {
        // setOpen(false);
        setLast(!last)
        callback(id);
    };

    const lang = I18n.getLanguage();
    const text = (newsArr[indexArr].content[lang] || newsArr[indexArr].content.en).replace(/='([^']*)'/g, '="$1"');

    return <ThemeProvider theme={theme(themeName)}>
        <Dialog
            onClose={onClose}
            open={open}
            classes={{ paper: classes.paper }}
        >
            <div className={classes.blockInfo}>
                {new Date(newsArr[indexArr].created).toLocaleDateString(lang)}
                <Status className={classes.img} name={newsArr[indexArr].class} />
            </div>
            <DialogTitle>{I18n.t('You have unread news!')}</DialogTitle>
            <DialogTitle>{newsArr[indexArr].title[I18n.getLanguage()]}</DialogTitle>
            <DialogContent className={classes.overflowHidden} dividers>
                <div className={classes.root}>
                    <div className={classes.pre}>
                        {newsArr[indexArr]?.img &&
                            <CardMedia className={classes.img2} component="img" image={newsArr[indexArr].img} />}
                        <Typography
                            style={themeType === 'dark' ? { color: 'black' } : null}
                            variant="body2"
                            component="p">
                            {Utils.renderTextWithA(text)}
                        </Typography>
                        {newsArr[indexArr]?.link &&
                            <Button
                                variant="contained"
                                autoFocus
                                className={classes.link}
                                onClick={() => window.open(newsArr[indexArr].link, '_blank')}
                                color="primary">
                                {newsArr[indexArr].linkTitle ? newsArr[indexArr].linkTitle[lang] ? newsArr[indexArr].linkTitle[lang] : newsArr[indexArr].linkTitle : I18n.t('Link')}
                            </Button>}
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    autoFocus
                    onClick={onClose}
                    color="primary">
                    {I18n.t('Acknowledge')}
                </Button>
            </DialogActions>
        </Dialog>
    </ThemeProvider>;
}

export const newsAdminDialogFunc = (newsArr, current, themeName, themeType, callback) => {
    if (!node) {
        node = document.createElement('div');
        node.id = 'renderModal';
        document.body.appendChild(node);
    }
    return ReactDOM.render(<NewsAdminDialog newsArr={newsArr} themeName={themeName} themeType={themeType} current={current} callback={callback} />, node);
}