import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { dummyPosts, dummyGroups, tempGroup } from '@constants/tempData';
import type { PostData } from '@constants/tempInterface';
import formatDate from '@/utils/formatDate';

import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import PostCreate from '@/pages/PostCreate/index';
import Banner from '@/components/Home&CommunityFeed/Banner';
import FeedBox from '@/components/Home&CommunityFeed/FeedBox';
import SidePanel from '@/components/Home&CommunityFeed/SidePanel';
import WriteButton from '@/components/Home&CommunityFeed/WirteButton';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

const mock = new MockAdapter(axiosInstance);

// 무한스크롤로 보내줄 콘텐츠 개수
const PAGE_SIZE = 5;

mock.onGet('/posts').reply((config) => {
  const { page = 1, pageSize = PAGE_SIZE } = config.params;
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  const paginatedPosts = dummyPosts.slice(startIndex, endIndex);
  const hasMore = endIndex < dummyPosts.length;

  return [200, { data: paginatedPosts, hasMore }];
});

mock.onGet('/api/groups').reply(200, dummyGroups);

const Home: React.FC = () => {
  // 상태 정의
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false); // 글 작성 모달 상태
  const [posts, setPosts] = useState<PostData[]>([]); // 게시글 상태
  const [selectedPosts, setSelectedPosts] = useState<PostData[]>([]); // 필터링된 게시글 상태
  const [category, setCategory] = useState<number | string>('category'); // 선택된 카테고리
  const [community, setCommunity] = useState<string>('community'); // 선택된 커뮤니티
  const [isLoading, setIsLoading] = useState(false); // 데이터 로딩 상태
  const [page, setPage] = useState(1); // 현재 페이지 상태(무한스크롤)
  const [hasMore, setHasMore] = useState(true); // 남은 데이터 여부(무한스크롤)



  // 카테고리(종) 옵션
  const SelectCategoryOptions = [
    { value: 'category', label: '종' },
    { value: 'dog', label: '강아지' },
    { value: 'cat', label: '고양이' },
  ];

  // 커뮤니티 옵션
  const SelectCommunityOptions = [
    { value: 'community', label: '커뮤니티' },
    { value: '눈 / 피부 / 귀', label: '눈 / 피부 / 귀' },
    { value: '코', label: '코' },
    { value: '뇌·신경', label: '뇌·신경' },
  ];

  // 글 작성 모달 닫기 핸들러
  const handleCloseWriteModal = () => {
    setIsWriteModalOpen(false);
  };

  // 초기 게시글 데이터 가져오기 함수
  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/posts`, {
        params: { page: 1, pageSize: PAGE_SIZE },
      });

      setPosts(response.data.data);
      setHasMore(response.data.hasMore);
      setPage(2);
    } catch (error) {
      console.error('게시글 목록 조회 실패', error);
    }
  }, []);

  // 컴포넌트가 마운트 된 후 초기 데이터 가져오기
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 초기 렌더링 이후 게시글 로드 함수
  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return; // 로딩 중이거나 데이터 더 없으면 종료

    setIsLoading(true); // 로딩 상태 설정

    try {
      const response = await axiosInstance.get('/posts', {
        params: { page, pageSize: PAGE_SIZE },
      });

      setPosts((prevPosts) => [...prevPosts, ...response.data.data]);
      setPage((prevPage) => prevPage + 1);
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('추가 게시글 로드 실패', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [selectedPosts, hasMore, loadMorePosts, observerTarget]);

  useEffect(() => {
    if (category !== 'category' || community !== 'community') {
      const filteredPosts = posts.filter(
        (post) =>
          (category === 'category' || post.communityId.category === category) &&
          (community === 'community' ||
            post.communityId.community === community)
      );
      setSelectedPosts(filteredPosts);
    } else {
      setSelectedPosts(posts);
    }
  }, [posts, category, community]);

  const handleCategoryOptions = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCategory(event.target.value);
  };

  const handleCommunityOptions = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCommunity(event.target.value);
  };

  return (
    <>
      <Banner />
      <ContentContainer>
        <FeedBoxContainer>
          <FeedOptionContainer>
            <SelectContainer>
              <P>분류: </P>
              <Select
                selectStyle="round"
                selectSize="sm"
                options={SelectCategoryOptions}
                onChange={handleCategoryOptions}
              />
              <Select
                selectStyle="round"
                options={SelectCommunityOptions}
                onChange={handleCommunityOptions}
              />
            </SelectContainer>
            <WriteButton setIsWriteModalOpen={setIsWriteModalOpen} />
            {isWriteModalOpen && (
              <Modal
                title="글 작성하기"
                value="등록"
                component={<PostCreate />}
                onClose={handleCloseWriteModal}
              />
            )}
          </FeedOptionContainer>
          {selectedPosts.map((post, index) => (
            <FeedBox
              key={post._id}
              postId={post._id}
              title={post.title}
              content={post.content}
              uploadedDate={formatDate(post.createdAt)}
              nickname={post.userId.nickName}
              profileSrc={post.userId.profileImage[0]}
              communityName={post.communityId.community}
              communityCategory={
                post.communityId.category === 0 ? '강아지' : '고양이'
              }
              likeCount={post.likedUsers.length}
              ref={index === selectedPosts.length - 1 ? observerTarget : null}
            />
          ))}
        </FeedBoxContainer>
        <SidePanel name="추천 커뮤니티" elementArray={tempGroup} />
      </ContentContainer>
    </>
  );
};

export default Home;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 70% 20%;
  justify-content: space-between;
  width: 100%;
  margin-top: 40px;

  & > * {
    margin-bottom: 30px;
  }
`;

const FeedBoxContainer = styled.div`
  color: var(--color-grey-1);
`;

const FeedOptionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  justify-content: space-between;
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm-1);

  & > * {
    margin-right: 10px;
  }
`;

const P = styled.p`
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-ft-1);
`;
