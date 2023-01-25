import { test } from 'tap';
import { build } from '../helper';
import { createUser, createPost, createProfile } from '../utils/requests';

test('users', async (t) => {
  const app = await build(t);

  await t.test('POST /users => success', async (t) => {
    const { body: user } = await createUser(app);

    const res_findUser = await app.inject({
      url: `/users/${user.id}`,
    });

    t.ok(res_findUser.statusCode < 300);
  });

  await t.test('PATCH /users/:id => failure; fake params.id', async (t) => {
    const res_patchUser = await app.inject({
      url: `/users/fakeId`,
      method: 'PATCH',
      payload: {},
    });

    t.ok(res_patchUser.statusCode > 300);
  });

  await t.test('PATCH /users/:id => success', async (t) => {
    let { body: user } = await createUser(app);

    const changedEmail = 'qwe@gmail.com';

    user = await app
      .inject({
        url: `/users/${user.id}`,
        method: 'PATCH',
        payload: {
          email: changedEmail,
        },
      })
      .then((r: any) => r.json(0));

    t.ok(user.email === changedEmail);
  });

  await t.test(
    'POST /users/:id/subscribeTo => failure; fake params.id',
    async (t) => {
      const res_subscribeTo = await app.inject({
        url: `/users/fakeId/subscribeTo`,
        method: 'POST',
        payload: {
          userId: 'fakeId',
        },
      });

      t.ok(res_subscribeTo.statusCode > 300);
    }
  );

  await t.test(
    'POST /users/:id/subscribeTo => failure; fake body.userId',
    async (t) => {
      const { body: user } = await createUser(app);

      const res_subscribeTo = await app.inject({
        url: `/users/${user.id}/subscribeTo`,
        method: 'POST',
        payload: {
          userId: 'fakeId',
        },
      });

      t.ok(res_subscribeTo.statusCode > 300);
    }
  );

  await t.test(
    'POST /users/:id/subscribeTo => failure; body.userId is already a subscriber',
    async (t) => {
      const { body: user1 } = await createUser(app);
      const { body: user2 } = await createUser(app);

      await app.inject({
        url: `/users/${user1.id}/subscribeTo`,
        method: 'POST',
        payload: {
          userId: user2.id,
        },
      });

      const res_subscribeTo = await app.inject({
        url: `/users/${user1.id}/subscribeTo`,
        method: 'POST',
        payload: {
          userId: user2.id,
        },
      });

      t.ok(res_subscribeTo.statusCode > 300);
    }
  );

  await t.test('POST /users/:id/subscribeTo => success', async (t) => {
    let { body: user1 } = await createUser(app);
    let { body: user2 } = await createUser(app);
    let { body: user3 } = await createUser(app);

    user1 = await app
      .inject({
        url: `/users/${user1.id}/subscribeTo`,
        method: 'POST',
        payload: {
          userId: user2.id,
        },
      })
      .then((r: any) => r.json());

    t.ok(
      user1.userSubscribedToIds.includes(user2.id) &&
        user1.userSubscribedToIds.length === 1,
      'userSubscribedToIds should be updated'
    );

    user1 = await app
      .inject({
        url: `/users/${user1.id}/subscribeTo`,
        method: 'POST',
        payload: {
          userId: user3.id,
        },
      })
      .then((r: any) => r.json());
    t.ok(
      user1.userSubscribedToIds.includes(user3.id) &&
        user1.userSubscribedToIds.length === 2,
      'userSubscribedToIds should be updated'
    );

    user2 = await app
      .inject({
        url: `/users/${user2.id}`,
      })
      .then((r: any) => r.json());
    user3 = await app
      .inject({
        url: `/users/${user3.id}`,
      })
      .then((r: any) => r.json());
    t.ok(
      user2.subscribedToUserIds.includes(user1.id) &&
        user3.subscribedToUserIds.includes(user1.id),
      'subscribedToUserIds should be updated'
    );
  });

  await t.test(
    'POST /users/:id/unsubscribeFrom => failure; fake params.id',
    async (t) => {
      const res_unsubscribeFrom = await app.inject({
        url: `/users/fakeId/unsubscribeFrom`,
        method: 'POST',
        payload: {
          userId: 'fakeId',
        },
      });

      t.ok(res_unsubscribeFrom.statusCode > 300);
    }
  );

  await t.test(
    'POST /users/:id/unsubscribeFrom => failure; fake body.userId',
    async (t) => {
      const { body: user1 } = await createUser(app);

      const res_unsubscribeFrom = await app.inject({
        url: `/users/${user1.id}/unsubscribeFrom`,
        method: 'POST',
        payload: {
          userId: 'fakeId',
        },
      });

      t.ok(res_unsubscribeFrom.statusCode > 300);
    }
  );

  await t.test(
    'POST /users/:id/unsubscribeFrom => failure; body.userId is valid but our user is not following him',
    async (t) => {
      const { body: user1 } = await createUser(app);
      const { body: user2 } = await createUser(app);

      const res_unsubscribeFrom = await app.inject({
        url: `/users/${user1.id}/unsubscribeFrom`,
        method: 'POST',
        payload: {
          userId: user2.id,
        },
      });

      t.ok(res_unsubscribeFrom.statusCode > 300);
    }
  );

  await t.test('POST /users/:id/unsubscribeFrom => success', async (t) => {
    let { body: user1 } = await createUser(app);
    let { body: user2 } = await createUser(app);
    let { body: user3 } = await createUser(app);

    await app.inject({
      url: `/users/${user1.id}/subscribeTo`,
      method: 'POST',
      payload: {
        userId: user2.id,
      },
    });
    await app.inject({
      url: `/users/${user1.id}/subscribeTo`,
      method: 'POST',
      payload: {
        userId: user3.id,
      },
    });

    user1 = await app
      .inject({
        url: `/users/${user1.id}/unsubscribeFrom`,
        method: 'POST',
        payload: {
          userId: user2.id,
        },
      })
      .then((r: any) => r.json());
    t.ok(
      !user1.userSubscribedToIds.includes(user2.id) &&
        user1.userSubscribedToIds.length === 1,
      'userSubscribedToIds should be updated'
    );
    user1 = await app
      .inject({
        url: `/users/${user1.id}/unsubscribeFrom`,
        method: 'POST',
        payload: {
          userId: user3.id,
        },
      })
      .then((r: any) => r.json());
    t.ok(
      !user1.userSubscribedToIds.includes(user3.id) &&
        user1.userSubscribedToIds.length === 0,
      'userSubscribedToIds should be updated'
    );

    user2 = await app
      .inject({
        url: `/users/${user2.id}`,
      })
      .then((r: any) => r.json());
    user3 = await app
      .inject({
        url: `/users/${user3.id}`,
      })
      .then((r: any) => r.json());
    t.ok(
      !user2.subscribedToUserIds.includes(user1.id) &&
        !user3.subscribedToUserIds.includes(user1.id),
      'subscribedToUserIds should be updated'
    );
  });

  await t.test('DELETE /users/:id => failure; fake params.id', async (t) => {
    const res_deleteUser = await app.inject({
      url: `/users/fakeId`,
      method: 'DELETE',
    });

    t.ok(res_deleteUser.statusCode > 300);
  });

  await t.test(
    'DELETE /users/:id => success; user with relations',
    async (t) => {
      const { body: user1 } = await createUser(app);
      let { body: user2 } = await createUser(app);
      const { body: post } = await createPost(app, user1.id);
      const { body: profile } = await createProfile(app, user1.id, 'basic');

      await app.inject({
        url: `/users/${user1.id}/subscribeTo`,
        method: 'POST',
        payload: {
          userId: user2.id,
        },
      });

      await app
        .inject({
          url: `/users/${user1.id}`,
          method: 'DELETE',
        })
        .then((r: any) => r.json());

      const res_findUser1 = await app.inject({
        url: `/users/${user1.id}`,
      });
      t.ok(res_findUser1.statusCode > 300, 'user must be deleted');

      user2 = await app
        .inject({
          url: `/users/${user2.id}`,
        })
        .then((r: any) => r.json());
      t.ok(
        !user2.subscribedToUserIds.includes(user1.id),
        'no links to the deleted user in subscribedToUserIds'
      );

      const res_findPost = await app.inject({
        url: `/posts/${post.id}`,
      });
      const res_findProfile = await app.inject({
        url: `/profiles/${profile.id}`,
      });
      t.ok(res_findPost.statusCode > 300, 'post must be deleted');
      t.ok(res_findProfile.statusCode > 300, 'profile must be deleted');
    }
  );
});
