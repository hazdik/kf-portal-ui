import * as React from 'react';
import { compose, withState } from 'recompose';

import Button from 'uikit/Button';
import step2Screenshot from 'assets/gen3TokenScreenshot.png';
import { deleteSecret, setSecret } from 'services/secrets';
import { GEN3 } from 'common/constants';
import { getUser as getGen3User } from 'services/gen3';
import { ModalFooter } from 'components/Modal/index.js';

import { css } from 'emotion';
import { injectState } from 'freactal';
import XIcon from 'react-icons/lib/fa/close';
import RightArrows from 'react-icons/lib/fa/angle-double-right';

const modalWidth = 1000;
const closeButtonWidth = 30;
const styles = css`

  span.numberBullet{
    color: white;
    background: #00afed;
    width: 14px;
    border-radius: 50%;
    margin: 20px;
    padding: 10px;
    height: 14px;
    display: inline-block;
    text-align: center;
  }

  .tokenTitle {
    padding:20px;
    color: #2b388f;
    font-size: 18px;
    font-weight: bold;
  }
`;

const enhance = compose(
  injectState,
  withState('gen3Key', 'setGen3Key', ''),
  withState('invalidToken', 'setInvalidToken', false),
);

const submitGen3Token = async ({ token, setIntegrationToken, onSuccess, onFail }) => {
  //token = JSON.stringify(token);
  token = token.replace(/\s+/g, '');
  await setSecret({ service: GEN3, secret: token });
  await getGen3User(token)
    .then(userData => {
      setIntegrationToken(GEN3, token);
      onSuccess();
    })
    .catch(response => {
      setIntegrationToken(GEN3, null);
      deleteSecret({ service: GEN3 });
      onFail();
    });
}


const Gen3Connection = ({
  state,
  effects,
  theme,
  gen3Key,
  setGen3Key,
  editingCavitca,
  setEditingGen3,
  invalidValue,
  setInvalidToken,
  ...props
}) => {
  return (
    <div css={styles}>
      <div>
        <div css={css`display:flex;`}>
          <div css={css`flex:1`}>
            <span className="numberBullet">1</span>
            <span>You will need to retrieve your authentication token from the <a href="https://gen3qa.kids-first.io" rel="noopener noreferrer" target="_blank">Kids First DCC Portal</a>. After Login, click on the "Profile" tab.</span>
          </div>
          <div css={css`flex:1`}>
            <img
              css={css`width:400px;`}
              src={step2Screenshot}
              alt="Screenshot of Gen3's Developer Den" />
          </div>
        </div>
        <div>
          <span className="numberBullet">2</span>
          <span>Click on "Create API Key", copy and paste it into the field below and click Connect.</span>
        </div>
        <div>
          <span className="tokenTitle">Gen3 Authentication Token:</span>
          <textarea
            className="css-19latnh"
            id="gen3Key"
            value={gen3Key}
            name="gen3"
            placeholder="Gen3 Key"

            onChange={e => setGen3Key(e.target.value)}
          />
        </div>
      </div>
      <ModalFooter
        {...{
          handleSubmit: () => {
            submitGen3Token({
              token: gen3Key,
              setIntegrationToken: effects.setIntegrationToken,
              onSuccess: props.onComplete,
              onFail: () => setInvalidToken(true)
            })
          },
          submitText: 'Connect'
        }}
      />
    </div>
  );
}

export default enhance(Gen3Connection);
