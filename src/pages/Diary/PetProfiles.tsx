import React, { useState } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Virtual } from 'swiper/modules';
import { LuPlus } from 'react-icons/lu';
import Modal from '@/components/common/Modal';
import PetRegister from '@/components/PetRegister/PetRegister';
import { Buddy } from '@/interfaces';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { CardsWrapper, Cards } from './card-components';
import PetCard from './PetCard';

const ProfilesTitle = styled.div`
  font-size: var(--font-size-hd-2);
  font-weight: var(--font-weight-bold);
  margin: 20px 0 30px 0;
`;

const StyledSwiper = styled(Swiper)`
  width: 100%;
  padding: 4px 10px;
  > div {
    padding-top: 8px;
  }
  > div:last-child {
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
  }
`;

const AddProfile = styled.div`
  width: 100px;
  height: 100px;
  background: var(--color-grey-3);
  border-radius: 50%;
  border: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  > svg {
    color: #b3b3b3;
    width: 50px;
    height: 50px;
  }
`;

const AddProfileMsg = styled.p`
  margin-top: 26px;
  font-size: 18px;
  text-align: center;
  color: #7d7d7d;
`;

interface ProfilesWrapperProps {
  name?: string;
  buddies?: BuddyProfile[];
}

// 공통 인터페이스 통합하기
interface BuddyProfile {
  _id: string;
  name: string;
  kind: string;
  age: number;
  buddyImage: string;
}

// 회원 이름과 버디 정보들을 받아와서 카드에 렌더링해준다.
const PetProfiles: React.FC<ProfilesWrapperProps> = ({ name, buddies }) => {
  const [petModalOpen, setPetModalOpen] = useState(false);
  const [petEditModalOpen, setPetEditModalOpen] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null); // 선택된 반려동물
  const [formData, setFormData] = useState<FormData | null>(null); // 수정/등록을 위한 폼데이터 상태

  const handleOpenPetModal = () => {
    setPetModalOpen(true);
  };
  const handleOpenPetEditModal = (buddyId: string) => {
    // API를 통해 특정 반려동물 정보 가져오기
    axios
      .get(`/api/buddies/${buddyId}`)
      .then((res) => {
        console.log('Buddy 1:', res.data);
        setSelectedBuddy(res.data); // 가져온 반려동물 정보 설정
        setPetEditModalOpen(true); // 수정 모달 열기
      })
      .catch((err) => {
        console.error('Error fetching buddy details:', err);
      });
  };

  const handleClosePetModal = () => {
    setPetModalOpen(false);
  };

  const handleClosePetEditModal = () => {
    setPetEditModalOpen(false);
    setSelectedBuddy(null); // 모달 창이 닫힐 때 선택된 반려동물 정보 초기화
  };

  // 폼데이터가 변화할때마다 상태 업데이트
  const handleFormDataChange = (data: FormData) => {
    setFormData(data);
  };

  // 가짜 API 설정
  const mock = new MockAdapter(axios);

  // 가짜 POST 요청 처리
  mock.onPost('/api/buddies').reply((config) => {
    console.log('요청 정보:', config);
    const formData = config.data;
    const entries = formData.entries();
    // Mock Post 확인용이므로 룰을 잠시 삭제
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of entries) {
      console.log(`${key}: ${value}`);
    }
    return [200, { success: true, message: '반려동물 등록 성공' }];
  });

  // 로딩처리 필요
  const handleFormSubmit = async () => {
    try {
      const res = await axios.post('/api/buddies', formData);
      console.log(res.data);
      handleClosePetModal();
    } catch (error) {
      console.log(error);
    }

    // 모달 닫기
    // console.log(formData?.get('name'));
  };

  return (
    <div>
      <ProfilesTitle>{name} 님의 반려동물</ProfilesTitle>
      <StyledSwiper
        virtual
        slidesPerView={4}
        spaceBetween={20}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination, Virtual]}
        className="mySwiper"
      >
        {buddies &&
          buddies.map((buddy, index) => (
            <SwiperSlide key={buddy._id} virtualIndex={index}>
              <PetCard
                buddy={buddy}
                onEdit={() => handleOpenPetEditModal(buddy._id)}
                onDelete={() => {}}
              />
            </SwiperSlide>
          ))}

        <SwiperSlide key={999} virtualIndex={999}>
          <CardsWrapper>
            <Cards className="add-card" onClick={handleOpenPetModal}>
              <AddProfile>
                <LuPlus />
              </AddProfile>
              <AddProfileMsg>프로필 추가</AddProfileMsg>
            </Cards>
          </CardsWrapper>
        </SwiperSlide>
      </StyledSwiper>
      {petModalOpen && (
        <Modal
          onClose={handleClosePetModal}
          title="동물 정보 등록"
          value="등록"
          component={
            <PetRegister
              petData={null}
              onFormDataChange={handleFormDataChange}
            />
          }
          onHandleClick={handleFormSubmit}
        />
      )}
      {petEditModalOpen && (
        <Modal
          onClose={handleClosePetEditModal}
          title="동물 정보 수정"
          value="수정"
          component={
            <PetRegister
              petData={selectedBuddy}
              onFormDataChange={handleFormDataChange}
            />
          }
          onHandleClick={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default PetProfiles;