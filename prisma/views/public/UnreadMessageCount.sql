SELECT
  mp.user_id,
  count(mm.id) AS unread_count
FROM
  (
    messenger_participants mp
    LEFT JOIN messenger_messages mm ON (
      (
        (mm.chatroom_id = mp.chatroom_id)
        AND (mm.participant_id <> mp.id)
        AND (mm.created_at > mp.message_read_at)
      )
    )
  )
GROUP BY
  mp.user_id;