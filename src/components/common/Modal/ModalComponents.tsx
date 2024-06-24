import React from 'react';
import styled from 'styled-components';
import Button from '../Button';

// 모달 헤더: 타이틀을 포함
const ModalHeaderContainer = styled.header`
  width: 100%;
  /* padding: 10px; */
  /* background-color: #f0f0f0; */
  /* border-bottom: 1px solid #ccc; */
`;

const Title = styled.div`
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-hd-1); //20
  color: var(--color-green-main);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-grey-2);
`;

interface ModalHeaderProps {
  children: React.ReactNode;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => (
  <ModalHeaderContainer>
    <Title>{children}</Title>
  </ModalHeaderContainer>
);

// 모달 바디
const ModalBodyContainer = styled.div`
  font-size: 16px;
  padding: 20px;
`;

interface ModalBodyProps {
  children: React.ReactNode;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
  <ModalBodyContainer>{children}</ModalBodyContainer>
);

// 모달 푸터: 제출, 취소 등 버튼을 포함
const ModalFooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  border-top: 1px solid var(--color-grey-2);
  width: 100%;
`;

const ButtonContainer = styled.div`
  padding: 0 0 20px 0;
`;

interface ModalFooterProps {
  onHandleClick?: () => void;
  value: string;
  onClose: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  onHandleClick,
  value,
  onClose,
}) => (
  <ModalFooterContainer>
    <ButtonContainer>
      <Button onClick={onHandleClick}>{value}</Button>
      <Button onClick={onClose}>취소</Button>
    </ButtonContainer>
  </ModalFooterContainer>
);
export { ModalHeader, ModalBody, ModalFooter };
