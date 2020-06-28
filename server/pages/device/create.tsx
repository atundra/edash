import { DeviceForm } from '../../ui/components/DeviceForm';
import { useRouter } from 'next/router';

export default () => {
  const router = useRouter();
  return (
    <>
      <h1>Create a new device</h1>
      <DeviceForm
        onSubmit={(data) =>
          fetch('/api/device', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }).then((res) => {
            if (res.ok) {
              router.push('/device');
            }
          })
        }
      />
    </>
  );
};
