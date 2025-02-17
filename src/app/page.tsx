'use client';
import { Button } from '@/components/ui/button';

export default function Home() {
  const handleClick = async () => {
    const question = '这篇文章主要讲了什么？';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question
        })
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        // setError(data.error);
        console.log(11, data.error);
      } else {
        // message: data.text,
      }
      // console.log('messageState', messageState);

      // setLoading(false);

      return Response.json(data, { status: 200 });

      //scroll to bottom
    } catch (error) {
      // setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  };

  return <Button onClick={handleClick}>Button</Button>;
}
