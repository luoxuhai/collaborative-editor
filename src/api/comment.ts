import request from '@/utils/request';

interface ICreateCommentRequest {
  groupId: string;
  parentId: string;
  replyId: string;
  content: string;
}

interface ICreateCommentResponse {
  comments: any[];
}

export const createComment = ({
  groupId,
  parentId,
  replyId,
  content,
}: ICreateCommentRequest) =>
  request.post<ICreateCommentRequest, ICreateCommentResponse>(
    `/comments/createComment`,
    {
      groupId,
      parentId,
      replyId,
      content,
    },
  );

export const deleteComment = ({ commentId }: { commentId: string }) =>
  request.delete(`/comments/deleteComment`, {
    params: {
      commentId,
    },
  });

export const queryComments = ({ groupId }: { groupId: string }) =>
  request.get(`/comments/queryComments`, {
    params: {
      groupId,
    },
  });

export const queryReplyList = ({ commentId }: { commentId: string }) =>
  request.get(`/comments/queryReplyList`, {
    params: {
      commentId,
    },
  });
