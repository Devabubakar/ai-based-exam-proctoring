/* eslint-disable no-unused-expressions */
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Button from '@material-ui/core/Button';
import axios from 'axios';

import { useSelector, useDispatch } from 'react-redux';
import PersonGroup from '../PersonGroup/PersonGroup';
import api from '../../utils/apiKeys';
import { detectAndVerifyUser, detectUser, verifyUser } from '../../firebase/firebaseUtils';
import { getCurrentUser, setIdentityStatus } from '../../redux/userReducer';

const videoConstraints = {
  width: 200,
  height: 200,
  facingMode: 'user'
};
const MainWebcam = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(getCurrentUser);
  const webcamRef = useRef(null);
  const [imageData, setImageData] = useState(null);

  useEffect(async () => {
    await detectAndVerifyUser();
  }, []);

  const sendData = async data => {
    const buff = Buffer.from(data.split(',')[1], 'base64');
    const res = await detectUser(buff);
    // console.log(res);
    if (res.length === 1) {
      const faceData = {
        faceId: res[0].faceId,
        personId: currentUser.personId,
        personGroupId: currentUser.groupId
      };

      const verify = await verifyUser(faceData);
      if (verify.isIdentical) {
        await dispatch(setIdentityStatus(true));
      }

      console.log(verify);
    } else if (res.length > 1) {
      console.log('Multiple faces detected');
    } else {
      console.log('No user Detected');
    }
  };
  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    await sendData(imageSrc);
  }, [webcamRef]);
  return (
    <div
      style={{
        overflow: 'hidden'
      }}
    >
      <Webcam
        screenshotFormat="image/JPEG"
        onUserMediaError={err => console.log('Access to Camera Denied')}
        onUserMedia={() => console.log('Access to Camera Granted')}
        ref={webcamRef}
        videoConstraints={videoConstraints}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zindex: 9
        }}
      />
      <br />
      <Button variant="contained" color="primary" onClick={capture}>
        {!currentUser.identityStatus ? 'Click Verify Your Identify' : 'Your are Verified  ✅  '}
      </Button>
    </div>
  );
};

export default MainWebcam;
