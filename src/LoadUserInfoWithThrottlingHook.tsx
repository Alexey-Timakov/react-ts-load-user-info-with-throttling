// Мы ожидаем, что Вы исправите синтаксические ошибки, сделаете перехват возможных исключений и улучшите читаемость кода.
// А так же, напишите кастомный хук useThrottle и используете его там где это нужно.
// Желательно использование React.memo и React.useCallback там где это имеет смысл.
// Будет большим плюсом, если Вы сможете закэшировать получение случайного пользователя.
// Укажите правильные типы.
// По возможности пришлите Ваш вариант в https://codesandbox.io

import React, { MouseEventHandler, useCallback, useRef, useState } from "react";

const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: any
};

type UserDictionary = Record<number, User>;

interface IButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
}

function Button({ onClick }: IButtonProps): JSX.Element {
  return (
    <button type="button" onClick={onClick}>
      Get random user
    </button>
  );
}

interface IUserInfoProps {
  user: User;
}

// Do not use memo here as it does not updates if props are the same
function UserInfo({ user }: IUserInfoProps): JSX.Element {

  return (
    <table
      style={{
        margin: "5rem auto",
        width: "100%"
      }}
    >
      <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function LoadUserInfoWithThrottling(): JSX.Element {
  const [item, setItem] = useState<number | null>(null);
  const users = useRef<UserDictionary>({});

  const receiveRandomUser = async () => {
    const minId = 1;
    const maxId = 10;

    const currentId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    console.log(currentId);

    if (users.current[currentId]) {
      // Info already exists, do not fetch - just show info from saved data
      setItem(prevId => currentId);
      return;
    }

    try {
      const response = await fetch(`${URL}/${currentId}`);
      const newUser = (await response.json()) as User;

      users.current[`${currentId}`] = newUser;

      setItem(prevId => currentId);

    } catch (error) {
      console.warn(error);
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    receiveRandomUser();
  };

  const throttledAction = useThrottle(handleButtonClick, 1000);

  return (
    <div>
      <header style={{ margin: "2rem" }}>Get a random user</header>

      <Button onClick={throttledAction} />

      {item && users.current[item] &&
        <UserInfo user={users.current[item]} />
      }
    </div>
  );
};

const useThrottle = (fn: Function, wait: number = 1000, option = { leading: true, trailing: true }) => {
  const timerId = useRef<NodeJS.Timeout | null>(null); // track the timer
  const lastArgs = useRef<any | null>(); // track the args

  // create a memoized debounce
  const throttle = useCallback(
    function (this: unknown, ...args: Parameters<any>) {
      const { trailing, leading } = option;
      // function for delayed call
      const waitFunc = () => {
        // if trailing invoke the function and start the timer again
        if (trailing && lastArgs.current) {
          fn.apply(this, lastArgs.current);
          lastArgs.current = null;
          timerId.current = setTimeout(waitFunc, wait);
        } else {
          // else reset the timer
          timerId.current = null;
        }
      };

      // if leading run it right away
      if (!timerId.current && leading) {
        fn.apply(this, args);
      }
      // else store the args
      else {
        lastArgs.current = args;
      }

      // run the delayed call
      if (!timerId.current) {
        timerId.current = setTimeout(waitFunc, wait);
      }
    },
    [fn, wait, option]
  );

  return throttle;
};