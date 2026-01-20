-- Check what topics have been practiced
SELECT 
    q.subject,
    q.topic,
    COUNT(DISTINCT qa.id) as attempts_count
FROM question_attempts qa
JOIN questions q ON qa.question_id = q.id
GROUP BY q.subject, q.topic
ORDER BY q.subject, q.topic;

-- Check total unique topics available per subject
SELECT 
    subject,
    COUNT(DISTINCT topic) as total_topics,
    string_agg(DISTINCT topic, ', ') as topics_list
FROM questions
WHERE topic IS NOT NULL
GROUP BY subject
ORDER BY subject;

-- Check if there are any question attempts at all
SELECT COUNT(*) as total_attempts FROM question_attempts;
